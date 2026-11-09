/**
 * 本地配置/存储模块。
 *
 * 负责两件事：
 *   1. 定义 Config 类——应用全部持久化配置的「字段模板 + 操作方法」，
 *      自选股、别名、成本价、价格提醒、快捷键、主题、分组等都挂在它上面。
 *   2. 提供一个单例导出对象（local_store）——封装 electron-json-storage 的
 *      读写、变更通知（onConfig 事件）、以及懒加载的 config getter。
 *
 * 持久化机制：底层用 electron-json-storage 把整个 Config 写进
 * `%APPDATA%/Stock-Monitor/stock-monitor-config.json`（见 reloadFromUserData）。
 * 每次 save() 会 diff 出变化的字段 key，通过 EventEmitter 广播「onConfig」事件，
 * 供主进程（index.ts / stock.ts / 各窗口）和渲染层联动刷新。
 *
 * 注意：本文件在「离线化」上有两个关键改造——
 *   - isVip() 恒真（不依赖云端会员）
 *   - safeMachineId() 容错（注册表不可读时退化为随机 UUID）
 */
import EventEmitter from "events";
import moment from "moment";
import { app } from "electron";
import { randomUUID } from "crypto";
import { Sug } from "../api/StockApi";
import logger from "../service/logger";

const storage = require('electron-json-storage');
const { machineIdSync } = require('node-machine-id')

/**
 * 设备标识读取。
 *
 * node-machine-id 会执行 `REG.exe QUERY ... MachineGuid`，在组策略受限、
 * 沙箱或精简系统上会直接抛错（Access is denied）。原实现把它放在 Config
 * 的字段初始化里，一旦失败，主进程在模块顶层就崩溃，被 uncaughtException
 * 吞掉后表现为「进程还在、但没有主界面」。离线版不使用云端设备标识，
 * 因此失败时退化为本地随机 UUID 即可。
 */
function safeMachineId(): string {
    try {
        return machineIdSync(true);
    } catch (err) {
        logger.log("machineIdSync unavailable, fallback to local uuid: " + err);
        return 'offline-' + randomUUID();
    }
}

// 单例事件发射器：配置变更时广播 onConfig 事件（save() 触发）
const eventEmmiter = new EventEmitter()

/**
 * 配置类：应用全部可持久化状态的字段模板。
 *
 * 构造时给每个字段一个默认值；加载时用 storage.getSync 的结果 Object.assign 覆盖
 * （见 get config()），因此这里列的字段就是配置文件里可能出现的最小「骨架」。
 */
export class Config {
    // ===== 显示 / 表格 =====
    fontSize: number = 14;                 // 字体大小（px）
    column: number[] = [0,1,2,3,4,9];      // 表格要显示的列的索引（对应 data_type 里的 value）
    opa: number = 100;                     // 窗口不透明度（0~100）
    model: string = "nm";                  // 界面模式：nm=正常，sm=精简（渲染层切换）
    themeMode: string = 'classic';         // 主题：classic（红涨绿跌）/ 自定义
    // 背景/字体色（新版 RGB + alpha 分离；old config 的 backColor/textColor 为旧格式）
    backColorNew: string = "#FFFFFF";
    backAlpha: number = 255;
    textColorNew: string = "#000000";
    textAlpha: number = 255;
    backColor: string = "rgba(255,255,255,255)";   // 旧版背景色（兼容保留）
    textColor: string = "rgba(90,90,90,255)";      // 旧版字体色（兼容保留）

    // ===== 窗口 =====
    bounds: any = null;                    // 主面板窗口位置/尺寸（null 表示未记录，用默认）
    chartBounds: any = null;               // 图表窗口位置
    hideSwitch: boolean = true;            // 是否启用「贴边自动隐藏」
    windowTransparent: boolean = false;    // 是否透明窗口
    openAtLogin: boolean = true;           // 是否开机自启

    // ===== 自选股数据 =====
    keys: Sug[] = [];                      // 自选股列表（Sug：含 code/marketCode/key/name 等）
    alias: any = {};                       // 股票别名：key -> 别名
    cost: any = {};                        // 成本：key -> {price, amount, date}
    groups: any = [];                      // 分组列表（字符串数组）
    groupsSwitch: boolean = true;          // 是否启用分组栏

    // ===== 提醒 =====
    alertInfos: any = {};                  // 价格提醒：key -> {downalert_switch/price/text, upalert_*...}
    alertsKey:any = {};                    // 已读提醒标记：key -> true（渲染层用）

    // ===== 快捷键 =====
    shortCutsSwitch:boolean = true;        // 是否启用全局快捷键
    shortCuts:any = {"boss":"Alt+`","adds":"Ctrl+t","addo":"Ctrl+]","mino":"Ctrl+["}; // 老板键/添加/加减透明度/分组切换

    // ===== 盈亏 =====
    profitMode:string = "ap";              // 盈亏显示模式：ap=金额+百分比，a=仅金额，其他=仅百分比
    profiteTotal: boolean = false;         // 是否显示「合计/当日」汇总（离线版强制 true）
    freqWhenHide: any = null;              // 面板隐藏时的轮询间隔（秒），null 用默认 15s

    // ===== 账号（离线版基本弃用）=====
    uuid: string = safeMachineId();        // 设备唯一标识（离线版退化为本地 UUID）
    token: string | null = null;           // 登录 token
    nickName: string | null = "";
    avatar: string | null = null;
    validTime: number | null = null;       // 会员有效期
    dueTo: string | null = null;
    NewUser: boolean = true;
    InviteUserID : number = 0;
    clickPromote : boolean = false;
    InviteCode : string | null= null;
    countDownTimeSec: number = 86400;      // 会员倒计时（秒，在线版存档）

    // ===== 升级 / 云端（在线版弃用）=====
    dynamicConfig: any = {};               // 云端下发的动态配置
    synUpdateTime: any = null;             // 上次云端同步时间
    skipInstall:string = "";               // 用户选择「跳过此版本」的版本号
    preparedInstall:any = {};              // 已下载待安装的升级包信息

    // ===== 代理 =====
    proxySwitch: any = false;              // false 或 {proxyHost,proxyPort,proxyUserName,proxyPassWord}

    // ===== 调试 =====
    debugSwitch: boolean = false;          // 是否开启 debug 日志（logger.logDebug 依据此开关）

    /**
     * 是否为Vip
     * 离线版：会员校验本地恒真，避免依赖云端账号体系与有效期字段。
     */
    isVip(): boolean {
        return true;
    }

    /**
     * 添加 Stock
     * @param st 
     * @returns 
     */
    addStock(st: Sug) {
        let index = this.keys.findIndex((value, index) => {
            return value.code == st.code && value.marketCode == st.marketCode
        })
        if (index >= 0) {
            return false;
        }
        this.keys.push(st)
        return true;
    }
    /**
     * 置顶股票
     * @param st 
     */
    setTopStock(st: Sug) {
        let index = this.keys.findIndex((value, index) => {
            return value.code == st.code && value.marketCode == st.marketCode
        })
        if (index >= 0) {
            this.keys.splice(index, 1);
            this.keys.unshift(st)
        }
    }
    /**
     * 移除 Stock
     * @param st 
     */
    removeStock(st: Sug) {
        let index = this.keys.findIndex((value, index) => {
            return value.code == st.code && value.marketCode == st.marketCode
        })
        if (index >= 0) {
            this.keys.splice(index, 1);
        }
    }
    /**
     * 设置别名
     * @param code 
     * @param alias 
     */
    setAlias(code: string, name: string) {
        this.alias[code] = name;
    }

    /**
     * 设置某支股票的成本价与持仓数量（key 为股票 marketCode+code）。
     * price/amount 允许为 null：为 null 时不更新该项，仅更新传入的那一项；
     * 同时记录「今天」为成本基准日，用于当日盈亏计算（见 stock.ts processData）。
     */
    setCost(key: string, price:number,amount:number){
        let old = this.cost[key];
        let now = new Date();
        let nowStr = now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate();
        if(!old){
            this.cost[key] = {price:price,amount:amount,date:nowStr};
        }else{
            if(price!=null&&price!=undefined){
                old.price = price;
                old.date = nowStr;
            }
            if(amount!=null&&amount!=undefined){
                old.amount = amount;
            }

            this.cost[key] = old;
        }
    }

    /**
     * 设置某支股票的价格提醒。
     * v 结构：{ key, at: 提醒类型(downalert_switch/upalert_switch), v: 值/开关 }。
     * v.v 为空串或 false 表示「关闭该提醒」，从 alertInfos[key] 里删掉对应类型；
     * 否则把 v.v 写入该类型。
     */
    setAlert(key: string, v:any){
        let ai = this.alertInfos[key];
        if(!ai){
            ai = {};
        }
        
        if(v.v==''||v.v==false){
            delete ai[v.at];
        }else{
            ai[v.at] = v.v;
        }

        console.log(ai);

        this.alertInfos[key] = ai
    }

    /**
     * 应用一个 Object
     * @param obj 
     */
    applyWith(obj: any) {
        Object.assign(this, obj)
        return this;
    }

    /**
     * 保存到磁盘。
     * 通过与上次快照 oldConfig 逐字段 JSON 对比，得到本次「变化了哪些 key」（diffKeys），
     * 然后写盘，并通过 onConfig 事件把这些变化广播给所有监听者，
     * 让主进程/渲染层只针对变化字段做增量响应（而非全量重刷）。
     */
    save() {
        const newConfig = appConfig as any;
        if (newConfig) {
            let diffKeys:any = [];
            Object.keys(newConfig).forEach((key) => {
                if(JSON.stringify(oldConfig[key]) != JSON.stringify(newConfig[key])){
                    diffKeys.push(key)
                }
            });
            oldConfig = JSON.parse(JSON.stringify(newConfig))

            // console.log("save config:")
            // console.log(newConfig)

            storage.set('stock-monitor-config', appConfig, function(error:any){
                if(error){
                    logger.log("save config err:")
                    logger.log(error+"")
                    logger.log(error.stack)
                }
            });
            // console.log("diff",diffKeys)
            eventEmmiter.emit("onConfig",appConfig,diffKeys)
        }
    }
}

// 上次 save() 时的配置快照，用于 diff 出变化字段
let oldConfig = storage.getSync("stock-monitor-config") ?? {};
///应用配置单例（懒加载，见 get config()）
var appConfig: Config | undefined

/**
 * local_store 默认导出：配置模块对外的唯一门面。
 *
 * 上层（index.ts / stock.ts / 各窗口）不直接 new Config() 或操作 storage，
 * 而是通过这一组方法读写，内部保证：修改后自动 save() + diff + 广播 onConfig。
 */
export default {
    /** 获取 electron-json-storage 的数据目录路径 */
    getPath(){
        return storage.getDataPath();
    },
    /**
     * 判断「首次启动后 10 分钟内快速退出」。
     * 用于托盘菜单「退出」时的分流：快速退出 → 引导到反馈窗口（advice），
     * 正常退出 → 直接退出。通过 firstLaunch 时间戳与当前时间差判断。
     */
    checkFirstLaunchAndQuickExit():boolean{
        let fl = storage.getSync("firstLaunch");
        if(fl.time==undefined||fl.time==null){
            storage.set('firstLaunch', {time:moment().toDate()}, null);
            return false;
        }else{
            let launch = moment(fl.time);
            let exit = moment();

            var duration = moment.duration(exit.diff(launch))

            if(duration.asMinutes()<10){
                return true;
            }else{
                return false;
            }
        }
    },
    /**
     * 离线版启动流程：app ready 后把存储目录切到 userData 并重建配置单例。
     *
     * 模块顶层读取发生在 app ready 之前，electron-json-storage 会使用默认的
     * `userData/storage/` 子目录；而实际配置保存在 userData 根目录。若不重置，
     * 会读到一份空配置（token 为空、无自选股、profiteTotal 为 false），
     * 进而误入已被禁用的登录窗口、且主界面不显示行情。
     */
    reloadFromUserData(): Config {
        storage.setDataPath(app.getPath('userData'));
        appConfig = undefined;                       // 让 get config() 重新懒加载
        const cfg = this.config;
        oldConfig = JSON.parse(JSON.stringify(cfg));
        return cfg;
    },
    /** 恢复出厂配置：用全新的默认 Config 覆盖当前所有配置 */
    restore(){
        this.applyWith(new Config());
    },
    /**
     * 「读-改-存」的原子编辑接口：fn 接收配置单例并就地修改。
     * 只要 fn 返回的不是 false，就自动触发一次 save()。
     * 大部分 setXxx/applyWith 都是它的薄封装。
     */
    editWith(fn: (config: Config) => any) {
        let ret = fn(this.config)
        if (ret != false) {
            this.config.save()
        }
        return ret;
    },
    /**
     * 附加一个Object
     * @param obj 
     */
    applyWith(obj: any) {
        this.editWith((config: Config) => {
            config.applyWith(obj)
        });
    },
    /**
     * 是否为Vip
     */
    get isVip(): boolean {
        return this.config.isVip()
    },
    /**
     * 由 opa（0~100）换算成 Electron 窗口 setOpacity 需要的 alpha（0.05~1.0）。
     * 映射规则：opa=0 → 0.05，opa=100 → 1.0，中间线性。
     * 之所以不直接用 opa/100，是为了让「最透明」时仍保留 0.05 不至于完全不可见。
     */
    get alpha(): number {
        return (this.config.opa * 0.95) / 100 + 0.05
    },
    /**
     * 添加股票
     * @param sug 
     */
    addStock(sug: Sug) {
        return this.editWith((cfg: Config) => cfg.addStock(sug));
    },
    removeStock(sug: Sug) {
        return this.editWith((cfg: Config) => cfg.removeStock(sug));
    },
    setTopStock(sug: Sug) {
        return this.editWith((cfg: Config) => cfg.setTopStock(sug));
    },
    setAlias(code: string, name: string) {
        return this.editWith((cfg: Config) => cfg.setAlias(code, name))
    },
    setCost(key: string, price: number,amount:number) {
        return this.editWith((cfg: Config) => cfg.setCost(key, price,amount))
    },
    setAlert(key: string, v:any) {
        return this.editWith((cfg: Config) => cfg.setAlert(key, v))
    },
    
    on(event: string, listener: (config: Config,diffKeys:any) => void) {
        eventEmmiter.on(event, listener);
    },
    removeListener(event: string, listener: (config: Config,diffKeys:any) => void) {
        eventEmmiter.removeListener(event, listener);
    },
    /**
     * 配置单例的懒加载 getter。
     * 首次访问时：用默认字段 + storage 里已持久化的配置合并出 appConfig 单例；
     * 之后一直返回同一实例（内存态），修改后靠 save() 写盘。
     * 这里还做了「升级用户」的兼容：旧配置可能没有 preg/nextg 两个分组切换
     * 快捷键，此处补上默认值，避免 registerGlobalShortcut 时未定义。
     */
    get config(): Config {
        if (appConfig == null) {
            appConfig = new Config().applyWith(storage.getSync("stock-monitor-config"));

            //针对升级的用户的写法
            let sc = appConfig.shortCuts;
            if(!sc["preg"]){
                sc["preg"] = "Alt+q";
            }
            if(!sc["nextg"]){
                sc["nextg"] = "Alt+w";
            }

            return appConfig;
        }
        return appConfig
    },
}