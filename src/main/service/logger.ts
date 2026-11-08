import theLogger from "electron-log"
import local_store from "../storage/local_store"

/**
 * 日志服务（离线个人版）
 *
 * 原实现会把日志写入文件并提供「上传日志给开发者」的入口。离线版只保留
 * console 输出，不落盘、不压缩上传；方法签名保持兼容，方便调用方无需改动。
 */

theLogger.transports.file.maxSize = 1002430
theLogger.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}'
let date = new Date()
let datestr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
theLogger.transports.file.fileName = datestr + '.log'
console.log("logger Path:" + theLogger.transports.file.getFile().path)

export default {
    logDebug(msg: any) {
        if (local_store.config.debugSwitch) {
            this.log(msg)
        }
    },
    log(msg: any) {
        if (typeof msg === 'object' && msg !== null) {
            msg = JSON.stringify(msg)
        }
        console.log("[Logger]", msg)
    },
    openLogDir() {
        // 离线版不写日志文件，故无目录可打开
        return null
    },
    getLogPath(): string | null {
        return null
    },
    async compressAndSend() {
        // 日志上传已禁用
        return null
    }
}
