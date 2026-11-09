import { AppWindow } from "../base/app_window";

/**
 * 模块级注释：添加股票弹窗窗口
 *
 * 职责与角色：
 * 「添加自选股」弹窗，继承 AppWindow。无边框小窗口，渲染路由为 "/addstock"，
 * 由 openNative() 统一创建/单例管理。用户在弹窗中搜索并添加自选股。
 */
export class AddStockWindow extends AppWindow {

    /**
     * 配置窗口外观：宽 680、高 371 的无边框弹窗（尺寸为魔法数字，用于适配弹窗内容布局）。
     * @param options 待修改的窗口构造参数
     */
    configWindow(options: Electron.BrowserWindowConstructorOptions): void {
        options.width = 680
        options.height = 371
        options.frame = false
    }
    /**
     * 窗口创建成功回调：加载 "/addstock" 路由渲染添加股票页面。
     * @param win 创建完成的 BrowserWindow
     */
    onWindowCreated(win: Electron.CrossProcessExports.BrowserWindow): void {
        win.loadWithRoute("/addstock")
    }


}