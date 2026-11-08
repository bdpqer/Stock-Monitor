import { ipcMain, IpcMainInvokeEvent } from "electron";
import codffect from "../api/codffect";
import { AppWindow } from "../base/app_window";
import local_store,{Config} from '../../main/storage/local_store'

/**
 * 登录窗口
 */
export class LoginWindow extends AppWindow {
    ///登录回调
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
                let data = await codffect.loginWithWechat(dataUp);

                console.log("loginwin::::")
                console.log(data);

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

    ///窗口关闭
    onWindowClosed(): void {
        ipcMain.removeHandler("login")
    }


}

