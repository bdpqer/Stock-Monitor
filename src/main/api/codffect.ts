import axios from "axios";
import fs from "fs";
import local_store from "../storage/local_store";
import { app } from "electron";
import https from "https";
const FormData = require('form-data');
var HttpsProxyAgent = require('https-proxy-agent');

/**
 * 云端服务适配层（离线个人版）
 *
 * 原项目通过 gs.codeffect.top 提供微信登录、会员、支付、统计、日志上传与配置同步，
 * 由主进程的登录 / 支付 / 统计 / 邀请 / 代理测试等流程按需调用。
 * 本仓库为离线版：所有方法均为本地 stub，不发起任何请求、不读写用户账号。
 *
 * apiClient 与请求拦截器按原结构保留，便于日后按需恢复某个能力；由于没有任何
 * 方法调用 apiClient，运行时不会产生网络请求。恢复某项能力时只需改回对应方法。
 */

// 云服务 axios 实例：与原项目结构保持一致，离线版无任何方法调用它，故不会发出请求
const apiClient = axios.create({
    baseURL: 'https://www.baidu.com',  // 云端服务地址
    timeout: 3000,  // 超时 3 秒
    httpsAgent: new https.Agent({
        rejectUnauthorized: false,  // 忽略证书校验（原为兼容自签名/代理环境）
    })
});

// 组装随请求附带的基础设备信息，供请求拦截器注入到 params 中（离线版不被触发）
let getPublicConfig = () => {
    let conf = local_store.config;
    let deviceid = conf.uuid;  // 本机唯一标识（用于云端区分设备）
    let os = process.platform;  // 操作系统平台，如 win32
    let osv = process.getSystemVersion();  // 系统版本号
    let appv = app.getVersion();  // 应用版本号
    let osa = ''  // 系统位数
    // 根据 CPU 架构推断系统位数：32 位架构归为 32bit，64 位架构归为 64bit
    if (['x32', 'arm', 'mips', 'ia32', ''].includes(process.arch)) {
        osa = '32bit'
    } else if (['x64', 'arm64', 'ppc64'].includes(process.arch)) {
        osa = '64bit'
    }
    return {
        from: os,
        deviceid: deviceid,
        os: os,
        osv: osv,
        appv: appv,
        osa: osa
    }
}

// 请求拦截器：在每次请求的查询参数中注入设备信息；离线版因无人调用 apiClient 而不生效
apiClient.interceptors.request.use(function (config) {
    config.params = Object.assign(config.params, getPublicConfig())  // 合并设备信息到查询参数
    return config;
}, function (error) {
    return Promise.reject(error);  // 请求前出错则原样抛出
})

export default {
    /** 微信登录：离线版禁用 */
    // 固定 reject('login-disabled')，向调用方表明登录功能已被禁用
    async loginWithWechat(code: string): Promise<any> {
        return Promise.reject('login-disabled')
    },
    /** 统计埋点上报：离线版空实现，恒返回 null，不真正上报 */
    async statisticPoke(common: any, postBody: any): Promise<any> {
        return null
    },
    /** 日志/文件（zip）上传：离线版空实现，恒返回 null */
    async uploadFile(zipFilePath: string): Promise<any> {
        return null
    },
    /** 用户反馈/建议上传：离线版空实现，恒返回 null */
    async sendAdvice(content: string): Promise<any> {
        return null
    },
    /** 异常上报：仅打印本地日志，不真正上报，恒返回 null */
    async sendException(content: string): Promise<any> {
        console.log('sendException:' + content)
        return null
    },
    /** 拉取云端配置：离线版空实现，恒返回 null */
    async getConfig(version: string): Promise<any> {
        return null
    },
    /** 云端数据同步：离线版空实现，恒返回 null */
    async syncData(operation: boolean): Promise<any> {
        return null
    },
    /** 获取商品（会员套餐）信息：离线版返回空数组，表示无可购买项 */
    async getGoodsInfo(): Promise<any> {
        return []
    },
    /** 获取支付链接：离线版空实现，恒返回 null */
    async getPayURL(goodID: string): Promise<any> {
        return null
    },
    /** 查询支付状态：离线版空实现，恒返回 null */
    async getPayStatus(orderID: number): Promise<any> {
        return null
    },
    /** 获取用户信息：离线版空实现，恒返回 null */
    async getUserInfo(): Promise<any> {
        return null
    },
    /** 网络连通性检测：离线版不做外部探测 */
    // 恒返回 false，不发起真实的联网探测
    async checkBaidu(): Promise<any> {
        return false
    },
    /** 填写邀请码：离线版空实现，恒返回 null */
    async fillInviteCode(Code: string): Promise<any> {
        return null
    },
    /** 获取会员详情：离线版空实现，恒返回 null */
    async getVipDetail(): Promise<any> {
        return null
    },
    /** 代理连通性测试：离线版空实现，恒返回 null */
    async testProxy(host: string, port: number): Promise<any> {
        return null
    },
}
