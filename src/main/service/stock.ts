import storeService from './index'
import stockApi, { Stock } from '../api/StockApi'
import { ipcMain, WebContents } from 'electron';
import appConfig, { Config } from '../storage/local_store'
import logger from './logger';
import local_store from '../storage/local_store';
import EventEmitter from "events";

const eventEmmiter = new EventEmitter()

var _indexWindowVisible = true;

/**
 * 发送内容
 */
var ipcSender: WebContents | null;

/**
 * 计时 Instance
 */
var scheduleInstance: NodeJS.Timeout | null;

function _cancelSchedule() {
    ///取消上一次计时
    if (scheduleInstance) {
        clearTimeout(scheduleInstance)
    }
}

/**
 * 规范下一次刷新
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
var globalSugMap: any = {};

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
                //弹出提示
                showAlert = true;
            }else if(prev!=null&&prev[key]&&price&&text&&cuStock.price){
                let preStock:Stock = prev[key].stock;
                
                if(preStock&&preStock.price&&preStock.price>=price&&cuStock.price<price){
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
                    showAlert = true;
                }
            }

            if(showAlert){
                eventEmmiter.emit("alertPrice",{text:text,key:cuStock.key,at:"upalert_switch"})
            }
        }
    }
}

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
                stock.cost = cost.price;
                stock.dayProfite = (stock.price-cost.price)*cost.amount;
            }else{
                stock.dayProfite = stock.preClose*cost.amount*stock.per;
            }
            
        }else{
            stock.dayProfite = 0;
        }

        if(cost&&cost.amount>0&&cost.price>0){
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
 * 更新股票信息
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

///强制拉取缓存股票信息
ipcMain.on("fetch-stock", () => {
    if (prevResponse != null) {
        ipcSender?.send('stock-update', prevResponse)
    }
});

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