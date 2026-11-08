import { IpcMainInvokeEvent } from "electron";
import { Sug } from "../api/StockApi";
import configStore,{Config} from '../storage/local_store'
import StockUpdateService from '../service/stock';

export default {

    /**
     * 添加股票
     * @param ipcEvent 
     * @param data
     * 
     * 1:添加成功
     * 2:需要买会员 
     */
    async addStock(ipcEvent: IpcMainInvokeEvent, data: Sug) {
        //检查是否登录,及己存在股票数量
        let sugs = await this.listUserSug()

        if (configStore.isVip || sugs.length < 1) {
            if (configStore.editWith((config) => config.addStock(data))) {
                return 1;
            } else {
                return 3;
            }
        } else {
            return 2;
        }
    },
    /**
     * 移除
     * @param ipcEvent 
     * @param data 
     * @returns 
     */
    async removeStock(ipcEvent:IpcMainInvokeEvent,data:Sug){
        configStore.removeStock(data)
        return true;
    },
    async setTopStock(ipcEvent:IpcMainInvokeEvent,data:Sug){
        configStore.setTopStock(data);
    },
    /**
     * 自选股拖拽排序：把 from 移动到 to 之前（after=true 时移动到之后）。
     * 调用方是渲染层的 drag-sort.js，经 ipc.invoke('api', 'sortKeys', ...) 进入。
     */
    async sortKeys(data: { from: string; to: string; after?: boolean }) {
        const from = data && data.from
        const to = data && data.to
        const after = !!(data && data.after)
        if (!from || !to || from === to) return false

        configStore.editWith((config) => {
            const keys: any[] = config.keys as any[]
            const fromIndex = keys.findIndex((k) => k.key === from)
            const toIndex = keys.findIndex((k) => k.key === to)
            if (fromIndex < 0 || toIndex < 0) return false
            const [item] = keys.splice(fromIndex, 1)
            const insertAt = keys.findIndex((k) => k.key === to)
            keys.splice(after ? insertAt + 1 : insertAt, 0, item)
        })
        return true
    },
    /**
     * 获取用户添加的所有Sug
     */
    async listUserSug(): Promise<Sug[]> {
        return configStore.config.keys

    },

    getStock(key:string){
        return StockUpdateService.getStockData(key);
    },

    onEvent(eventKey:string, listener: (args:any) => void){
        StockUpdateService.onEvent(eventKey,listener);
    },
    removeEvent(eventKey:string,listener: (args:any) => void){
        StockUpdateService.removeEvent(eventKey,listener);
    },
    forStockUpdate(){
        StockUpdateService.forceUpdate();
    },
}