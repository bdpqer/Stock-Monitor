import { AppWindow } from "../base/app_window";

/**
 * 模块级注释：会员窗口
 *
 * 职责与角色：
 * 继承 AppWindow，用于展示会员/VIP 页面，渲染路由 "/vip"。
 * 离线个人维护版中该窗口基本不再使用，保留原结构。
 */
export class VipWindow extends AppWindow{
    /**
     * 配置窗口外观：固定宽 700、高 700，标题「会员」。
     * @param options 待修改的窗口构造参数
     */
    configWindow(options: Electron.BrowserWindowConstructorOptions): void {
       options.width = 700
       options.height = 700
       options.title = "会员"
    }
    /**
     * 窗口创建成功回调：加载 "/vip" 路由渲染会员页面。
     * @param win 创建完成的 BrowserWindow
     */
    onWindowCreated(win: Electron.CrossProcessExports.BrowserWindow): void {
        win.loadWithRoute("/vip")
    }

    
}