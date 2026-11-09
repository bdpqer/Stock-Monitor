import { AppWindow } from "../base/app_window";
import { screen } from "electron";
import local_store from "../storage/local_store";

/**
 * 模块级注释：分时 / K 线图窗口
 *
 * 职责与角色：
 * 继承 AppWindow，用于展示某只股票的分时图 / K 线图，渲染路由 "/chart?key=<股票代码>"。
 * 支持窗口复用：通过 setStock 更新当前股票代码，reload 复用已有窗口向渲染层推送刷新。
 */
export class ChartWindow extends AppWindow{

    ///当前图表窗口展示的股票标识（股票代码；或对象形式便于携带多个查询参数）
    stockKey : any  = null;

    /**
     * 配置窗口外观：宽 400、高 285 的无边框窗口，标题「分时」。
     * 不透明度取配置的 alpha；若存在历史 chartBounds 则恢复窗口位置（宽高沿用默认，不恢复）。
     * @param options 待修改的窗口构造参数
     */
    configWindow(options: Electron.BrowserWindowConstructorOptions): void {
       options.width = 400
       options.height = 285
       options.title = "分时"
       options.frame = false;

       let appConfig = local_store;
       options.opacity = appConfig.alpha;

       //若有历史图表窗口位置，则恢复 x/y（宽高保持默认值，避免缩放差异导致布局异常）
       if(local_store.config.chartBounds){
            let bounds = local_store.config.chartBounds;
            options.x = bounds.x;
            options.y = bounds.y;
            // options.width = bounds.width;
            // options.height = bounds.height;
       }
    }

    /**
     * 窗口创建成功回调：根据 stockKey 的类型拼接路由查询串并加载。
     *   - 对象类型：把每个键值对拼成 `${k}=${v}` 再以 & 连接（支持多参数，如 key/code/period 等）；
     *   - 其他类型：直接按 `key=<stockKey>` 加载。
     * @param win 创建完成的 BrowserWindow
     */
    onWindowCreated(win: Electron.CrossProcessExports.BrowserWindow): void {
        if (typeof this.stockKey === 'object') {
            let query: string[] = Object.keys(this.stockKey).map((item => {
                return `${item}=${this.stockKey[item]}`
            }))
            win.loadWithRoute("/chart?"+query.join('&'));
        } else {
            win.loadWithRoute("/chart?key="+this.stockKey);
        }
        
    }
    /**
     * 设置图表窗口展示的股票标识（用于窗口复用前更新目标股票）。
     * @param key 股票代码，或携带多个查询参数的对象
     */
    setStock(key:any){
        this.stockKey = key;
    }
    /**
     * 复用已有窗口刷新：通过 ipc "reload" 通道把新的 stockKey 推送给渲染层，触发图表重载。
     * why：避免重复创建窗口，复用单例窗口仅更新内部数据。
     */
    reload(){
        console.log("reload:"+this.stockKey);
        this.win?.webContents.send("reload",this.stockKey);
    }
}