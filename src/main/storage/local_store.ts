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

const eventEmmiter = new EventEmitter()

export class Config {
    fontSize: number = 14;
    column: number[] = [0,1,2,3,4,9];
    keys: Sug[] = [];
    opa: number = 100;
    uuid: string = safeMachineId();
    model: string = "nm";
    bounds: any = null;
    alias: any = {};
    themeMode: string = 'classic';
    token: string | null = null;
    nickName: string | null = "";
    avatar: string | null = null;
    validTime: number | null = null;
    dueTo: string | null = null;
    NewUser: boolean = true;
    InviteUserID : number = 0;
    clickPromote : boolean = false;
    InviteCode : string | null= null;

    cost: any = {};
    countDownTimeSec: number = 86400;

    //old config
    backColor: string = "rgba(255,255,255,255)";
    textColor: string = "rgba(90,90,90,255)";

    hideSwitch: boolean = true;
    dynamicConfig: any = {};
    synUpdateTime: any = null;
    alertsKey:any = {};
    shortCutsSwitch:boolean = true;
    shortCuts:any = {"boss":"Alt+`","adds":"Ctrl+t","addo":"Ctrl+]","mino":"Ctrl+["};
    skipInstall:string = "";
    preparedInstall:any = {};
    profitMode:string = "ap";
    chartBounds: any = null;
    //proxy
    proxySwitch: any = false;
    alertInfos: any = {};
    windowTransparent: boolean = false;
    openAtLogin: boolean = true;
    freqWhenHide: any = null;
    profiteTotal: boolean = false;
    groups: any = [];
    groupsSwitch: boolean = true;


    //debug
    debugSwitch: boolean = false;

    //背景
    backColorNew: string = "#FFFFFF";
    backAlpha: number = 255;

    //字体
    textColorNew: string = "#000000";
    textAlpha: number = 255;

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
     * 保存到磁盘
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

let oldConfig = storage.getSync("stock-monitor-config") ?? {};
///应用配置
var appConfig: Config | undefined

export default {
    getPath(){
        return storage.getDataPath();
    },
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
    restore(){
        this.applyWith(new Config());
    },
    //保存配置
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