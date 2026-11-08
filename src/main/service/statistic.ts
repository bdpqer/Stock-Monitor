/**
 * 统计埋点（离线个人版）
 *
 * 原实现会把事件、设备号、系统版本上报到云端。离线版保留 poke() 接口但不做
 * 任何处理，主进程里大量 statistic.poke(...) 调用无需改动，也不会产生网络请求。
 */
export default {
    poke(eventKey: string, params: any) {
        // 统计上报已禁用
    }
}
