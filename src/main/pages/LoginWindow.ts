import { ipcMain, IpcMainInvokeEvent } from "electron";
import codffect from "../api/codffect";
import { AppWindow } from "../base/app_window";
import local_store,{Config} from '../../main/storage/local_store'

/**
 * 模块级注释：登录窗口
 *
 * 职责与角色：
 * 继承 AppWindow，渲染路由 "/login"。窗口创建时通过 ipcMain.handle 注册 "login"
 * 处理器，接收渲染层的登录请求并分发：
 *   - device 类型：离线版「游客/设备」登录，直接放行（不校验凭证），回填本地配置后关闭窗口；
 *   - wechat 类型：调用 codffect.loginWithWechat（在线版微信登录，离线版中被 stub）。
 * 登录成功后通过 onLoginFinish 回调通知上层，并关闭窗口。
 */
export class LoginWindow extends AppWindow {
    ///登录完成回调（由创建方注入，登录成功后调用）
    onLoginFinish: Function | null | undefined;

    ///配置窗口参数
    configWindow(options: Electron.BrowserWindowConstructorOptions): void {
        options.width = 280;
        options.height = 400;
        options.title = "登录"
    }


    ///窗口创建成功
    onWindowCreated(win: Electron.CrossProcessExports.BrowserWindow): void {
        win.loadWithRoute("/login")


        /**
        * 处理登录操作
        * ipc 契约：渲染层通过 ipcRenderer.invoke('login', type, dataUp) 发起登录
        *   - @param type  登录方式："device"（设备/游客，离线直接放行）、"wechat"（微信）
        *   - @param dataUp 登录携带的数据（微信登录时传入的凭证/Code 等）
        *   - @return 是否登录成功（成功 true；未知类型返回 false）
        */
        ipcMain.removeHandler('login')
        ipcMain.handle("login", async (event: IpcMainInvokeEvent, type: string, dataUp: string) => {
            if (type === "device") {
                ///游客登录 
                this.onLoginFinish?.call(this,null);
                ///关闭窗口
                win.close()
                win.destroy()
                return true;
            }
            if (type === "wechat") {
                //调用（被 stub 的）微信登录接口，获取用户信息
                let data = await codffect.loginWithWechat(dataUp);

                console.log("loginwin::::")
                console.log(data);

                //将登录结果回填进本地配置（昵称、token、头像、有效期、邀请信息等）
                local_store.applyWith({
                    nickName:data.NickName,
                    token:data.Token,
                    avatar:data.Avatar,
                    validTime:data.ValidTime,
                    dueTo:data.DueTo,
                    synUpdateTime:null,
                    NewUser:data.NewUser,
                    InviteUserID:data.InviteUserID,
                    InviteCode:data.InviteCode,
                });

                ///微信登录
                this.onLoginFinish?.call(this,data)
                ///关闭窗口
                win.close()
                win.destroy()
                return true;
            }
            return false;
        });
    }

    ///窗口关闭：移除 "login" ipc 处理器，避免残留/重复注册
    onWindowClosed(): void {
        ipcMain.removeHandler("login")
    }


}