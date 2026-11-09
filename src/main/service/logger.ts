import theLogger from "electron-log"
import local_store from "../storage/local_store"

/**
 * 日志服务（离线个人版）
 *
 * 原实现会把日志写入文件并提供「上传日志给开发者」的入口。离线版只保留
 * console 输出，不落盘、不压缩上传；方法签名保持兼容，方便调用方无需改动。
 *
 * 被主进程各服务模块 import 使用（如 system.ts 的升级流程），对外提供 log / logDebug /
 * openLogDir / getLogPath / compressAndSend 一套统一的日志出口。
 */

// 以下仍按原结构配置 electron-log 的文件传输：设置单文件最大体积、行格式与按日命名文件
theLogger.transports.file.maxSize = 1002430  // 单日志文件最大体积（约 1MB）
theLogger.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}'  // 日志行格式模板
let date = new Date()  // 取当前日期，用于给日志文件命名
let datestr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()  // 拼成年-月-日（getMonth 返回 0-11，需 +1）
theLogger.transports.file.fileName = datestr + '.log'  // 按日期命名日志文件，如 2026-11-08.log
console.log("logger Path:" + theLogger.transports.file.getFile().path)  // 打印日志文件完整路径，便于本地排查

export default {
    /**
     * 调试日志：仅当本地配置 debugSwitch 为 true 时才输出，避免默认情况刷屏。
     * @param msg 日志内容（任意类型，最终交给 log() 处理）
     */
    logDebug(msg: any) {
        if (local_store.config.debugSwitch) {
            this.log(msg)  // 复用 log() 的输出逻辑
        }
    },
    /**
     * 通用日志：对象先 JSON 序列化再打印，统一加 [Logger] 前缀，方便在控制台区分来源。
     * @param msg 日志内容（对象会被序列化，字符串/数字直接输出）
     */
    log(msg: any) {
        if (typeof msg === 'object' && msg !== null) {  // 仅对象需要序列化，null 仍按原样输出
            msg = JSON.stringify(msg)
        }
        console.log("[Logger]", msg)
    },
    /**
     * 打开日志所在目录：离线版不写日志文件，故无目录可打开，恒返回 null。
     */
    openLogDir() {
        // 离线版不写日志文件，故无目录可打开
        return null
    },
    /**
     * 获取日志文件路径：离线版恒返回 null。
     */
    getLogPath(): string | null {
        return null
    },
    /**
     * 压缩并上传日志：日志上传已禁用，恒返回 null。
     */
    async compressAndSend() {
        // 日志上传已禁用
        return null
    }
}
