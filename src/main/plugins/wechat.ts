import { ipcMain, session } from "electron";

var inited = false;
export default function WechatPlugin() {

    if (inited) {
        return
    }
    inited = true;
    var wechatState = -2;
    /**
    * 监听网页请求
    */
    session.defaultSession.webRequest.onBeforeRequest((detail, callback) => {
        if (detail.url.startsWith('https://gs.codeffect.top/user/login_wechat')) {
            let url = new URL(detail.url)
            let code = url.searchParams.get("code")
            ///扫码成功
            detail.webContents?.send("wechat", 2, code)
            return;
        } else if (detail.url.startsWith('https://lp.open.weixin.qq.com/connect/l/qrconnect?uuid=')) {
            if (detail.url.indexOf('last=404') > 0) {
                wechatState = 1;
                detail.webContents?.send("wechat", 1, "扫码成功")
            } else if (detail.url.indexOf("last=403") > 0) {
                if (wechatState == 1) {
                    wechatState = -1
                    detail.webContents?.send("wechat", -1, "取消登录")
                }
            } else {
                if (wechatState != 1) {
                    wechatState = 0
                    detail.webContents?.send("wechat", 0, "")
                }
            }
        }
        callback({});
    });
}