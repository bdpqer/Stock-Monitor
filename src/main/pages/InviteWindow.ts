import { AppWindow } from "../base/app_window";

/**
 * 模块级注释：邀请窗口
 *
 * 职责与角色：
 * 继承 AppWindow，用于展示「邀请好友」相关页面，渲染路由为 "/invite"。
 * 在离线个人维护版中基本很少使用，保留原结构。
 */
export class InviteWindow extends AppWindow{
    /**
     * 配置窗口外观：固定宽 331、高 404，无标题。
     * @param options 待修改的窗口构造参数
     */
    configWindow(options: Electron.BrowserWindowConstructorOptions): void {
       options.width = 331
       options.height = 404
       options.title = ""
    }
    /**
     * 窗口创建成功回调：加载 "/invite" 路由渲染邀请页面。
     * @param win 创建完成的 BrowserWindow
     */
    onWindowCreated(win: Electron.CrossProcessExports.BrowserWindow): void {
        win.loadWithRoute("/invite")
    }
}