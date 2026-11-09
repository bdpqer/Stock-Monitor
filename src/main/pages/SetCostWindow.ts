import process from "process";
import { AppWindow } from "../base/app_window";
import logger from "../service/logger";

/**
 * 模块级注释：设置成本价窗口
 *
 * 职责与角色：
 * 继承 AppWindow，用于设置/修改某只股票的成本价，渲染路由 "/cost?key=<股票代码>"。
 * 通过 setStock 指定目标股票，复用已有窗口时用 reload 推送给渲染层刷新。
 */
export class SetCostWindow extends AppWindow{

    ///目标股票代码
    stockKey : string | null = null;

    /**
     * 配置窗口外观：固定宽 380、高 460，标题「更多」；位置不强制居中（由系统/上次位置决定）。
     * @param options 待修改的窗口构造参数
     */
    configWindow(options: Electron.BrowserWindowConstructorOptions): void {
        options.width = 380
        options.center = false;
        // options.x = 0;
        // options.y = 0;
        options.height = 460
        // options.frame = false
        options.title = "更多"
        // options.alwaysOnTop = true;
    }
    /**
     * 窗口创建成功回调：校验股票代码是否存在，缺失则记录日志并放弃加载，
     * 否则加载 "/cost?key=<stockKey>" 路由渲染成本价设置页面。
     * @param win 创建完成的 BrowserWindow
     */
    onWindowCreated(win: Electron.CrossProcessExports.BrowserWindow): void {
        if(!this.stockKey){
            logger.log("key missing.");
            return;
        }

        win.loadWithRoute("/cost?key="+this.stockKey);
    }
    /**
     * 设置目标股票代码（窗口复用前更新股票）。
     * @param key 股票代码
     */
    setStock(key:string){
        this.stockKey = key;
    }
    /**
     * 复用已有窗口刷新：通过 ipc "reload" 通道把新的 stockKey 推送给渲染层。
     * why：避免重复创建窗口，复用单例窗口更新展示的股票。
     */
    reload(){
        console.log("reload:"+this.stockKey);
        this.win?.webContents.send("reload",this.stockKey);
    }
}