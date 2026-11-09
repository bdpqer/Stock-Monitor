import { AppWindow } from "../base/app_window";

/**
 * 模块级注释：问题反馈 / 股票监控窗口
 *
 * 职责与角色：
 * 继承 AppWindow，窗口标题为「股票监控」，渲染路由为 "/advice"。
 * 用于承载问题反馈、意见反馈等轻量内容（离线个人维护版）。
 */
export class AdviceWindow extends AppWindow{

    /**
     * 配置窗口外观：固定宽 380、高 420，窗口标题「股票监控」。
     * @param options 待修改的窗口构造参数
     */
    configWindow(options: Electron.BrowserWindowConstructorOptions): void {
       options.width = 380
       options.height = 420
       options.title = "股票监控"
    }

    /**
     * 窗口创建成功回调：加载 "/advice" 路由渲染反馈页面。
     * @param win 创建完成的 BrowserWindow
     */
    onWindowCreated(win: Electron.CrossProcessExports.BrowserWindow): void {
        win.loadWithRoute("/advice");
    }
}