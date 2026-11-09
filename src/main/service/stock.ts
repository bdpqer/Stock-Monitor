/**
 * 股票行情「调度 + 加工 + 提醒」服务（业务核心）。
 *
 * 这是看盘主面板的数据引擎，核心职责：
 *   1. 定时轮询：按会员态/可见性自适应频率地拉取自选股行情（见 _scheduleNext）
 *   2. 缓存合并：把腾讯 + 新浪两路结果合并进 globalSugMap，再按自选股顺序组装
 *   3. 盈亏计算：结合本地成本配置，计算当日盈亏与总盈亏（见 processData）
 *   4. 价格提醒：对比上次行情，检测价格「穿越」提醒线并发出 alertPrice 事件（见 checkPriceAlert）
 *   5. 下发数据：通过 ipcSender.send('stock-update', ...) 推送给渲染层
 *
 * 与渲染层的绑定是「显式 attach」：主面板窗口创建后调用 attachWebContents 把它的
 * WebContents 存到 ipcSender，之后所有 stock-update 都发给这个窗口；主面板销毁时
 * detachWebContents 解绑并停掉定时器。
 */
import storeService from './index'
import stockApi, { Stock } from '../api/StockApi'
import { ipcMain, WebContents } from 'electron';
import appConfig, { Config } from '../storage/local_store'
import logger from './logger';
import local_store from '../storage/local_store';
import EventEmitter from "events";

const eventEmmiter = new EventEmitter()

// 主面板窗口当前是否可见；不可见时降低轮询频率以省流量/省资源
var _indexWindowVisible = true;

/**
 * 发送内容
 */
var ipcSender: WebContents | null;

/**
 * 计时 Instance
 */
var scheduleInstance: NodeJS.Timeout | null;

/** 取消上一次还没触发的定时刷新 */
function _cancelSchedule() {
    ///取消上一次计时
    if (scheduleInstance) {
        clearTimeout(scheduleInstance)
    }
}

/**
 * 安排下一次刷新。
 * now=true 表示立即刷新一次（用于配置变化/新窗口附加时马上拿到数据），
 * 否则按频率计算延迟：VIP 3.2s；主面板不可见时降到 15s（或 freqWhenHide 配置值）。
 */
function _scheduleNext(now: boolean = false) {

    logger.logDebug("_scheduleNext:"+now)

    _cancelSchedule()
    ///如果需要即时更新
    if (now) {
        _updateStockInfo(true)
        return
    }

    ///Vip获取时间修改
    let fetchTime = appConfig.isVip ? 3200 : 60000;

    // 面板隐藏时降频：优先用配置 freqWhenHide，否则 15s
    if(!_indexWindowVisible&&appConfig.isVip){
        if(appConfig.config.freqWhenHide==null){
            fetchTime = 15000;
        }else{
            fetchTime = appConfig.config.freqWhenHide*1000;
        }
    }

    logger.logDebug("fetchTime:"+fetchTime);

    //1.根据用户状态计算更新时间
    scheduleInstance = setTimeout(_updateStockInfo, fetchTime)
}

///上一次结果
var prevResponse: any = null;
// 全局行情缓存：key -> Stock（腾讯、新浪两路结果合并后都进这里）
var globalSugMap: any = {};

/**
 * 价格提醒的「穿越」检测。
 *
 * 把上一轮 prev 规整成 { key -> {stock} }，然后对当前每一只股票，
 * 分别判断「跌破下限」和「涨破上限」：
 *   - downalert（跌到价以下提醒）：prev 为空时只要当前价已低于提醒价就提醒；
 *     否则要求「上一次 >= 提醒价 且 当前 < 提醒价」——即价格向下穿越临界线的那一刻。
 *   - upalert（涨到价以上提醒）：方向相反，向上穿越。
 * 触发时向 eventEmmiter 发 alertPrice 事件，由 index.ts 监听并弹原生对话框。
 */
function checkPriceAlert(prev:any,current:any){
    // console.log(prev);
    // console.log(current);
    let tmp:any = {};
    if(prev!=null){
        for(let i in prev){
            let v = prev[i];
            if(v.stock){
                tmp[v.stock.key] = v;
            }else{
                logger.log("no stock found in v:")
                logger.log(v)
            }
        }

        prev = tmp;
    }
    

    let alertInfos = local_store.config.alertInfos;
    for(let i in current){
        let cuStock:Stock = current[i].stock;
        if(!cuStock){
            logger.log("cuStock not valid.");
            continue;
        }

        let key:any = cuStock.key;
        // 该股票是否有配置提醒
        let v = alertInfos[key];
        // let cuStock:Stock = current[key];
        if(!v){
            continue;
        }
        if(v.downalert_switch){
            let price = v.downalert_price;
            let text = v.downalert_text;
            let showAlert = false;
            if(prev==null&&price&&text&&cuStock.price&&cuStock.price<price){
                // 首次（无历史）且当前已跌破：直接提醒
                showAlert = true;
            }else if(prev!=null&&prev[key]&&price&&text&&cuStock.price){
                let preStock:Stock = prev[key].stock;
                
                if(preStock&&preStock.price&&preStock.price>=price&&cuStock.price<price){
                    // 上一刻 >= 提醒价、当前 < 提醒价：向下穿越，提醒
                    showAlert = true;
                }
            }
            if(showAlert){
                eventEmmiter.emit("alertPrice",{text:text,key:cuStock.key,at:"downalert_switch"})
            }
        }
        if(v.upalert_switch){
            let price = v.upalert_price;
            let text = v.upalert_text;
            let showAlert = false;
            if(prev==null&&price&&text&&cuStock.price&&cuStock.price>price){
                //弹出提示
                showAlert = true;
            }else if(prev!=null&&prev[key]&&price&&text&&cuStock.price){
                let preStock:Stock = prev[key].stock;
                
                if(preStock&&preStock.price&&preStock.price<=price&&cuStock.price>price){
                    // 向上穿越：提醒
                    showAlert = true;
                }
            }

            if(showAlert){
                eventEmmiter.emit("alertPrice",{text:text,key:cuStock.key,at:"upalert_switch"})
            }
        }
    }
}

/**
 * 为每只股票补算盈亏字段（就地修改 stock 对象）。
 *
 * 分两种情况：
 *   1. 今日有成本基准（cost 的 date 是今天且有 price）→ dayProfite 用（现价-成本）*数量
 *   2. 否则（历史持仓）→ dayProfite 用 昨收*数量*涨跌幅 近似
 * 总盈亏 totalPro/totalProPer 只要成本>0 就按（现价-成本价）*数量 计算。
 */
function processData(stockData:any){
    let now = new Date();
    let nowStr = now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate();
    for(let i in stockData){
        let stock = stockData[i].stock;
        if(!stock){
            logger.log("processData stock not valid:")
            logger.log(stockData[i])
            continue
        }

        let conf = local_store.config;
        let cost = conf.cost[stock.key];
        if(cost&&cost.amount>0){
            if(nowStr==cost.date&&cost.price){
                // 今日新纪录的成本：当日盈亏 = (现价 - 成本价) * 数量
                stock.cost = cost.price;
                stock.dayProfite = (stock.price-cost.price)*cost.amount;
            }else{
                // 历史成本：当日盈亏用 昨收*数量*涨跌幅 近似（无当日基准价可用）
                stock.dayProfite = stock.preClose*cost.amount*stock.per;
            }
            
        }else{
            stock.dayProfite = 0;
        }

        if(cost&&cost.amount>0&&cost.price>0){
            // 总盈亏 = (现价 - 成本价) * 数量；收益率 = 盈亏 / (成本价*数量)
            let profite = (stock.price - cost.price)*cost.amount
            let per = profite/(cost.price*cost.amount);
            stock.totalPro = profite;
            stock.totalProPer = per;
            stock.cost = cost.price;
        }else{
            stock.totalPro = 0;
            stock.totalProPer = 0;
        }
    }
}

/**
 * 更新股票信息（一次完整轮询周期）。
 *
 * 流程：
 *   1. 读自选股列表；为空则推空数据并返回
 *   2. force 时先用缓存 globalSugMap 拼一份旧数据立即下发，让界面「秒回」
 *   3. 并行/顺序拉腾讯 + 新浪行情，合并进 globalSugMap
 *   4. 按自选股顺序组装 {sug, stock} 数组
 *   5. 对比 prevResponse 做价格提醒（checkPriceAlert）与盈亏计算（processData）
 *   6. 通过 ipcSender 下发 stock-update，并安排下一轮 _scheduleNext
 */
async function _updateStockInfo(force: boolean = false) {
    logger.logDebug("_updateStockInfo:"+force);

    let stockData: any = [];
    try {
        ///1.拉取用户添加的所有股票信息
        let sugList = await storeService.listUserSug()
        if(sugList.length==0){
            ipcSender?.send('stock-update', {data:[]})
            logger.log("sugList.length==0")
            return;
        }

        if (force) {
            let stockData2: any = [];
            sugList.forEach((sug) => {
                if (sug && sug.key) {
                    stockData2.push({ sug: sug, stock: globalSugMap[sug.key] })
                }
            })
            ipcSender?.send('stock-update', {
                data: stockData2
            })
        }

        logger.logDebug("getStocks:"+force);

        ///2.根据Sug请求股票信息
        let retStock = await stockApi.getStocks(sugList,false);

        logger.logDebug("getSinaStocks:"+force);

        let sinaStock = await stockApi.getSinaStocks(sugList);

        logger.logDebug("getSinaStocks done."+force);

        if (retStock!=null){
            globalSugMap = Object.assign(globalSugMap,retStock);
        }else{
            logger.log("update tencent stock data fail.")
        }

        if(sinaStock!=null){
            globalSugMap = Object.assign(globalSugMap,sinaStock);
        }

        ///3.组装 sug 与 Stock 的信息
        sugList.forEach((sug) => {
            if (sug && sug.key) {
                stockData.push({ sug: sug, stock: globalSugMap[sug.key] })
            }
        })

        
        if(stockData.length>0){
            //对比上次数据和这次数据，看看是否价格穿透
            let prevData = null;
            if(prevResponse!=null){
                prevData = prevResponse.data;
            }
            checkPriceAlert(prevData,stockData);
    
            processData(stockData);
    
            prevResponse = {
                data: stockData
            }
        }else{
            logger.log("stockData is empty.");
        }
        
        ///4.发送数据到前端
        ipcSender?.send('stock-update', prevResponse)
    
        logger.logDebug("will _scheduleNext:"+ipcSender)
    
        if (ipcSender) {
            ///5.计划下一次更新
            _scheduleNext(false)
        }

    } catch (e:any) {
        logger.log("stock-update-err:");
        let exceptionStr = "uncaughtException:" + e + "|||" + e.stack;
        logger.log(exceptionStr);
    }
}

// 渲染层请求「立即取一次缓存数据」：直接回放最近一次 stock-update
ipcMain.on("fetch-stock", () => {
    if (prevResponse != null) {
        ipcSender?.send('stock-update', prevResponse)
    }
});

// 配置变更监听：自选股列表(keys)或登录态(token)变化时，立即强制刷新一次
const configLister = (config: Config, diffKeys: any) => {
    if (diffKeys.indexOf('keys') >= 0 || diffKeys.indexOf('token') >= 0) {
        _scheduleNext(true)
    }
}
/**
 * 主界面更新处理
 * */
export default {
    /**
     *  附加到窗口
     */
    attachWebContents(contents: WebContents) {
        ipcSender = contents;
        appConfig.removeListener("onConfig", configLister)
        appConfig.on("onConfig", configLister)
        _scheduleNext(true)

        logger.logDebug("attachWebContents:"+ipcSender)
    },
    /**
     * 移除 WebContents
     * @param contents 
     */
    detachWebContents(contents: WebContents) {
        if (ipcSender === contents) {
            appConfig.removeListener("onConfig", configLister)
            ipcSender = null
            _cancelSchedule()
        }

        logger.logDebug("detachWebContents:"+ipcSender)
    },

    /**
     * 查询股票数据
     * @param key 
     */
    getStockData(key:string){
        return globalSugMap[key];
    },

    onEvent(eventKey:string, listener: (args:any) => void){
        eventEmmiter.on(eventKey,listener);
    },
    removeEvent(eventKey:string,listener: (args:any) => void){
        eventEmmiter.removeListener(eventKey,listener);
    },
    forceUpdate(){
        _scheduleNext(true);
    },
    /**
     * 这个api主要是为了实现当主面板不可见时，降低请求频率的功能的。
     * @param isvisible indexdow是否可见
     */
    setIndexWindowVisible(isvisible:boolean){
        _indexWindowVisible = isvisible
    }
}