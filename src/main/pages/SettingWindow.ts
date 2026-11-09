import { AppWindow } from "../base/app_window";
import appConfig, { Config } from '../storage/local_store';

/**
 * 模块级注释：设置窗口
 *
 * 职责与角色：
 * 继承 AppWindow，用于展示应用设置页面，渲染路由默认 "/setting"（支持通过 setRoute
 * 切换到子路由，如 "/setting/xxx"）。窗口创建时注册 configListener，监听本地配置
 * 变化（appConfig 的 onConfig 事件）并把变更实时转发给渲染层。
 */
export class SettingWindow extends AppWindow{

    ///当前渲染路由（默认 /setting，可带子路由）
    route : string = "/setting";
    
    /**
     * 配置窗口外观：固定宽 700、高 600，标题「设置」。
     * @param options 待修改的窗口构造参数
     */
    configWindow(options: Electron.BrowserWindowConstructorOptions): void {
        options.width = 700
        options.height = 600
        options.title = "设置"
    }
    /**
     * 设置窗口渲染路由（用于切换到具体设置子页面）。
     * @param route 目标路由，如 "/setting" 或带子路由的 "/setting/xxx"
     */
    setRoute(route:string){
        this.route = route;
    }

    ///配置变更监听器（保存引用，便于管理）
    configListener: any | null = null;

    /**
     * 窗口创建成功回调：加载当前路由；注册配置变更监听器，
     * 将 appConfig 的 onConfig 事件转发到 handleConfigChanged。
     * @param win 创建完成的 BrowserWindow
     */
    onWindowCreated(win: Electron.CrossProcessExports.BrowserWindow): void {
        win.loadWithRoute(this.route)
        
        var that = this;
        //包装回调捕获 this，转发到成员方法
        this.configListener = (config: Config,diffKeys:any) => {
            that.handleConfigChanged(config,diffKeys);
        }
        appConfig.on('onConfig', this.configListener)
    }

    /**
     * 配置变更处理：将最新配置及变更 key 通过 ipc "app-config" 推送给渲染层，
     * 使设置页面实时同步最新配置状态。
     * @param config 变更后的配置对象
     * @param diffKeys 发生变更的配置 key 数组
     */
    handleConfigChanged(config: Config,diffKeys:any): void {
        // this.win?.setOpacity(appConfig.alpha)
        this.win?.webContents?.send("app-config", config,diffKeys);
    }
}