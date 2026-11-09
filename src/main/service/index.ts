/**
 * 业务服务层（渲染层 IPC 命令到具体实现的转发层）
 *
 * 该模块以对象形式聚合导出，主进程注册 ipcMain 处理器时按方法名分发：
 * 渲染层通过 ipc.invoke('api', '方法名', ...) 发起请求，主进程据此路由到本层同名方法。
 *
 * 职责划分：
 * - 自选股增删/置顶/拖拽排序：addStock / removeStock / setTopStock / sortKeys / listUserSug，
 *   最终落到 local_store（基于 electron-json-storage 的本地持久化）。
 * - 行情查询与实时事件：getStock / onEvent / removeEvent / forStockUpdate，
 *   全部转发给 StockUpdateService（真实行情服务，直连腾讯/新浪公开接口）。
 *
 * 本层自身不做业务计算，只承担参数传递与返回值转发，使渲染层与底层服务解耦。
 */
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
    // 添加自选股：离线版无登录态，此处只按 "VIP 或自选股不足 1 只" 判断是否放行。
    // 返回码见上方 JSDoc——1 添加成功、2 需要买会员、3 添加失败（如重复添加）。
    async addStock(ipcEvent: IpcMainInvokeEvent, data: Sug) {
        //检查是否登录,及己存在股票数量
        // 先取当前自选股列表，用于判断是否已有股票（离线版只按数量做拦截）
        let sugs = await this.listUserSug()

        // VIP 或自选股不足 1 只时放行；否则走 else 返回 2
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
    // 移除自选股：按 key 从本地配置中删除，恒返回 true（删除结果由 removeStock 内部处理）
    async removeStock(ipcEvent:IpcMainInvokeEvent,data:Sug){
        configStore.removeStock(data)
        return true;
    },
    // 置顶自选股：把指定股票排到自选列表最前，无返回值
    async setTopStock(ipcEvent:IpcMainInvokeEvent,data:Sug){
        configStore.setTopStock(data);
    },
    /**
     * 自选股拖拽排序：把 from 移动到 to 之前（after=true 时移动到之后）。
     * 调用方是渲染层的 drag-sort.js，经 ipc.invoke('api', 'sortKeys', ...) 进入。
     */
    async sortKeys(data: { from: string; to: string; after?: boolean }) {
        const from = data && data.from  // 被拖拽的股票 key
        const to = data && data.to  // 目标位置对应的股票 key
        const after = !!(data && data.after)  // after=true 表示放到 to 之后，否则放到 to 之前
        // 校验：from/to 缺失或相同则直接返回失败，避免无意义的移动
        if (!from || !to || from === to) return false

        configStore.editWith((config) => {
            const keys: any[] = config.keys as any[]  // 自选股列表（每项含唯一标识 key）
            const fromIndex = keys.findIndex((k) => k.key === from)  // 被拖拽项当前位置
            const toIndex = keys.findIndex((k) => k.key === to)  // 目标项当前位置
            // 任一元素找不到位置则放弃本次排序
            if (fromIndex < 0 || toIndex < 0) return false
            const [item] = keys.splice(fromIndex, 1)  // 先取出被拖拽项
            // 删除后重新定位 to 的下标（若 from 原在 to 之前，删除会使 to 下标前移一位）
            const insertAt = keys.findIndex((k) => k.key === to)
            // 依据 after 决定插入到 to 之后还是之前
            keys.splice(after ? insertAt + 1 : insertAt, 0, item)
        })
        return true
    },
    /**
     * 获取用户添加的所有Sug
     */
    // 获取用户全部自选股：直接返回 local_store 中持久化的 keys 数组（Sug 数组）
    async listUserSug(): Promise<Sug[]> {
        return configStore.config.keys

    },

    // 查询单只股票的最新行情：直接转发给行情服务 StockUpdateService
    getStock(key:string){
        return StockUpdateService.getStockData(key);
    },

    // 订阅行情事件：把渲染层传入的回调注册到行情服务，行情更新时触发
    onEvent(eventKey:string, listener: (args:any) => void){
        StockUpdateService.onEvent(eventKey,listener);
    },
    // 取消订阅行情事件（须传入与订阅时相同的回调引用才能移除）
    removeEvent(eventKey:string,listener: (args:any) => void){
        StockUpdateService.removeEvent(eventKey,listener);
    },
    // 强制立即刷新所有行情：转发给行情服务的 forceUpdate（直连腾讯/新浪接口主动拉取）
    forStockUpdate(){
        StockUpdateService.forceUpdate();
    },
}