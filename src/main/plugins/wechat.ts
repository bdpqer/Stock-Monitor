// 模块职责：微信扫码登录插件。通过拦截 webRequest 中的两个关键地址——
// 1) gs.codeffect.top 的登录回跳（携带 code）；2) 微信二维码轮询地址（更新登录状态）——
// 把扫码登录的状态通过 ipcMain 的 "wechat" 通道以事件形式推送给渲染层。
// 注：离线个人维护版已禁用微信扫码登录的云端依赖，本插件在离线版实际不会被触发。
import { ipcMain, session } from "electron";

// 单例标记：避免重复注册 webRequest 监听
var inited = false;
export default function WechatPlugin() {

    // 已初始化过则直接返回，保证监听器只挂载一次
    if (inited) {
        return
    }
    inited = true;
    // wechatState：记录当前登录流程状态
    //   -2 = 初始值（尚未进入任何登录流程）
    //   0  = 展示二维码/等待扫码
    //   1  = 扫码成功（等待确认）
    //   -1 = 用户取消登录
    var wechatState = -2;
    /**
    * 监听网页请求
    */
    session.defaultSession.webRequest.onBeforeRequest((detail, callback) => {
        // 分支一：登录服务器回跳，URL 中携带授权 code，表示扫码登录已成功完成
        if (detail.url.startsWith('https://gs.codeffect.top/user/login_wechat')) {
            let url = new URL(detail.url)
            let code = url.searchParams.get("code")
            ///扫码成功
            // 向渲染层发送状态 2 并附带 code，供后续换取登录凭证
            detail.webContents?.send("wechat", 2, code)
            return;
        } else if (detail.url.startsWith('https://lp.open.weixin.qq.com/connect/l/qrconnect?uuid=')) {
            // 分支二：微信二维码轮询地址，通过 last 参数判断当前扫码状态
            // last=404：二维码已被扫码（用户已扫，等待手机上确认）
            if (detail.url.indexOf('last=404') > 0) {
                wechatState = 1;
                detail.webContents?.send("wechat", 1, "扫码成功")
            } else if (detail.url.indexOf("last=403") > 0) {
                // last=403：用户在手机上取消了本次扫码登录（仅在已扫码成功之后才有意义）
                if (wechatState == 1) {
                    wechatState = -1
                    detail.webContents?.send("wechat", -1, "取消登录")
                }
            } else {
                // 其它情况（如二维码已过期等）：回到「展示二维码/等待扫码」状态，
                // 仅当当前不是「已扫码成功」状态时才重复推送，避免覆盖成功状态
                if (wechatState != 1) {
                    wechatState = 0
                    detail.webContents?.send("wechat", 0, "")
                }
            }
        }
        // 不拦截请求，显式告知 Electron 继续正常放行
        callback({});
    });
}