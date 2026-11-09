/**
 * 统计埋点（离线个人版）
 *
 * 原实现会把事件、设备号、系统版本上报到云端。离线版保留 poke() 接口但不做
 * 任何处理，主进程里大量 statistic.poke(...) 调用无需改动，也不会产生网络请求。
 */
export default {
    /**
     * 埋点上报（离线版空实现）。
     * 主进程各处通过 statistic.poke(eventKey, params) 记录用户行为；离线版函数体为空，
     * 不真正上报，也不会产生任何网络请求或额外开销。
     * @param eventKey 事件标识（字符串）
     * @param params   事件附加参数（键值对）
     * @returns 无返回值
     */
    poke(eventKey: string, params: any) {
        // 统计上报已禁用
    }
}
