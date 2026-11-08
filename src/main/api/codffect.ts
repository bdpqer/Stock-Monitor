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
 * 原项目通过 gs.codeffect.top 提供微信登录、会员、支付、统计、日志上传与配置同步。
 * 本仓库为离线版：所有方法均为本地 stub，不发起任何请求、不读写用户账号。
 *
 * apiClient 与请求拦截器按原结构保留，便于日后按需恢复某个能力；由于没有任何
 * 方法调用 apiClient，运行时不会产生网络请求。恢复某项能力时只需改回对应方法。
 */

const apiClient = axios.create({
    baseURL: 'https://gs.codeffect.top',
    timeout: 3000,
    httpsAgent: new https.Agent({
        rejectUnauthorized: false,
    })
});

let getPublicConfig = () => {
    let conf = local_store.config;
    let deviceid = conf.uuid;
    let os = process.platform;
    let osv = process.getSystemVersion();
    let appv = app.getVersion();
    let osa = ''
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

apiClient.interceptors.request.use(function (config) {
    config.params = Object.assign(config.params, getPublicConfig())
    return config;
}, function (error) {
    return Promise.reject(error);
})

export default {
    /** 微信登录：离线版禁用 */
    async loginWithWechat(code: string): Promise<any> {
        return Promise.reject('login-disabled')
    },
    async statisticPoke(common: any, postBody: any): Promise<any> {
        return null
    },
    async uploadFile(zipFilePath: string): Promise<any> {
        return null
    },
    async sendAdvice(content: string): Promise<any> {
        return null
    },
    async sendException(content: string): Promise<any> {
        console.log('sendException:' + content)
        return null
    },
    async getConfig(version: string): Promise<any> {
        return null
    },
    async syncData(operation: boolean): Promise<any> {
        return null
    },
    async getGoodsInfo(): Promise<any> {
        return []
    },
    async getPayURL(goodID: string): Promise<any> {
        return null
    },
    async getPayStatus(orderID: number): Promise<any> {
        return null
    },
    async getUserInfo(): Promise<any> {
        return null
    },
    /** 网络连通性检测：离线版不做外部探测 */
    async checkBaidu(): Promise<any> {
        return false
    },
    async fillInviteCode(Code: string): Promise<any> {
        return null
    },
    async getVipDetail(): Promise<any> {
        return null
    },
    async testProxy(host: string, port: number): Promise<any> {
        return null
    },
}
