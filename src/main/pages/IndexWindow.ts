import { screen } from "electron";
import { AppWindow } from "../base/app_window";
import logger from "../service/logger";
import StockUpdateService from '../service/stock';
import appConfig, { Config } from '../storage/local_store';

/**
 * 贴边隐藏状态机枚举（用常量表达，避免魔法数字）：
 * HIDE_TYPE_NOHIDE       0 = 未隐藏（正常显示）
 * HIDE_TYPE_RIGHT        1 = 已贴右边缘隐藏
 * HIDE_TYPE_LEFT         2 = 已贴左边缘隐藏
 * HIDE_TYPE_RIGHT_SHOW   3 = 从右边缘唤出显示
 * HIDE_TYPE_LEFT_SHOW    4 = 从左边缘唤出显示
 */
const HIDE_TYPE_NOHIDE = 0;
const HIDE_TYPE_RIGHT = 1;
const HIDE_TYPE_LEFT = 2;
const HIDE_TYPE_RIGHT_SHOW = 3;
const HIDE_TYPE_LEFT_SHOW = 4;

/**
 * 模块级注释：主页Window
 *
 * 职责与角色：
 * 本项目主面板（自选股看盘主界面），是无边框、置顶、透明、可贴边隐藏的悬浮面板。
 * 它继承 AppWindow，重写 configWindow 配置窗口外观，绑定股票数据服务 StockUpdateService，
 * 并维护 hideType 状态机实现「贴边隐藏/唤出」交互。窗口渲染路由为 "/"。
 */
export class IndexWindow extends AppWindow {

    ///是否开启贴边隐藏开关（true 表示允许贴边隐藏）
    public hideSwitch: boolean = true;
    ///当前贴边隐藏状态，取值见上方 HIDE_TYPE_* 常量
    public hideType: number = HIDE_TYPE_NOHIDE;

    /**
     * 配置主面板窗口外观。
     * why：
     *   - 无边框(frame=false) + 透明/无阴影 + 不显示任务栏(skipTaskbar=true) = 悬浮看盘面板；
     *   - alwaysOnTop=true 使面板始终置顶于其他窗口之上，便于盯盘。
     * @param options 待修改的窗口构造参数
     */
    configWindow(options: Electron.BrowserWindowConstructorOptions): void {
        options.alwaysOnTop = true;       // 始终置顶
        options.center = false;           // 不自动居中（位置由 bounds 决定）
        options.frame = false;            // 无边框
        options.skipTaskbar = true;       // 不显示在任务栏
        options.backgroundColor = "#00000000"; // 透明背景色（0x00000000 = 全透明黑色）
        options.thickFrame = false;       // 无系统厚边框
        options.hasShadow = false;        // 无系统阴影
        
        //透明窗口与否由配置决定；透明窗口无法 resize，故两种分支都固定不可缩放
        if(appConfig.config.windowTransparent){
            options.transparent = true;
            options.resizable = false;
        }else{
            options.transparent = false;
            options.resizable = false;
        }

        //从持久化配置恢复窗口位置/尺寸；
        //若无历史记录，则默认放到主显示器右下角（离底部 150、离右边缘 250 处），初始尺寸 250x150
        let bounds = appConfig.config.bounds;
        if (bounds == null) {
            let sb = screen.getPrimaryDisplay().bounds
            let y = sb.y + sb.height - 150
            let x = sb.x + sb.width - 250
            bounds = { x: x, y: y, width:  250, height: 150 }
        }
        if (bounds) {
            options.x = bounds.x;
            options.y = bounds.y;
            options.width = bounds.width;
            options.height = bounds.height;
        }
    }

    ///配置变更监听器（保存引用以便关闭时移除监听）
    configListener: any | null = null

    /**
     * 窗口创建成功回调。
     * why：
     *   - attachWebContents 将渲染进程绑定到股票服务，使其能接收行情推送/图表数据；
     *   - 监听 appConfig 的 onConfig 事件，把配置变更转发到渲染层；
     *   - 创建时把 cfg.bounds 置 null，让下次启动重新计算默认位置（避免脏数据）；
     *   - win32 平台强制设置置顶层级为 normal；
     *   - 设置窗口不透明度为配置的 alpha 值，再加载 "/" 路由渲染主面板。
     */
    onWindowCreated(win: Electron.CrossProcessExports.BrowserWindow): void {
        StockUpdateService.attachWebContents(win.webContents)
        var that = this;
        //包装配置变更回调，捕获 this 后转发
        this.configListener = (config: Config,diffKeys:any) => {
            that.handleConfigChanged(config,diffKeys);
        }
        appConfig.on('onConfig', this.configListener)
        //清空本窗口的持久化 bounds，使位置由首次默认逻辑决定
        appConfig.editWith((cfg) => { cfg.bounds = null })

        //Windows 平台下显式设置置顶层级为 normal
        if(process.platform=="win32"){
            win.setAlwaysOnTop(true,"normal")
        }
        win.setOpacity(appConfig.alpha)
        win.loadWithRoute("/")
    }

    /**
     * 窗口关闭回调：解绑渲染进程与股票服务，并移除配置变更监听，避免内存泄漏。
     */
    onWindowClosed(win: Electron.CrossProcessExports.BrowserWindow): void {
        StockUpdateService.detachWebContents(win.webContents)
        if (this.configListener) {
            appConfig.removeListener('onConfig', this.configListener)
        }
    }

    /**
     * 窗口位置/尺寸变化回调（当前暂不持久化 bounds，保留扩展位）。
     */
    onWindowBoundsChanged(bounds: Electron.Rectangle | undefined): void {
        if (bounds) {
            // appConfig.editWith((cfg) => {
            //     cfg.bounds = bounds
            // })
        }
    }

    /**
     * 窗口失去焦点回调（贴边隐藏逻辑当前被注释，保留扩展位）。
     */
    onWindowBlur(){
        // this.hideIfOnScreenBorder();
    }

    /**
     * 配置变更处理：更新窗口不透明度，并把新配置及变更的 key 数组转发给渲染层。
     * 若 hideSwitch（贴边隐藏开关）发生变化且被关闭，则先把窗口唤出到正常位置。
     * @param config 变更后的配置对象
     * @param diffKeys 发生变更的配置 key 数组
     */
    handleConfigChanged(config: Config,diffKeys:any): void {
        this.win?.setOpacity(appConfig.alpha)
        this.win?.webContents?.send("app-config", config,diffKeys);

        //仅当贴边隐藏开关变化时处理
        if(diffKeys[0]=="hideSwitch"){
            if(config.hideSwitch==false){
                //开关被关闭：若当前处于贴边隐藏状态，先唤出显示
                this.showIfOnScreenBorder();
            }

            this.hideSwitch = config.hideSwitch;
        }
    }

    /**
     * 获取当前窗口 bounds。
     * @returns 窗口边界（未创建时为 undefined）
     */
    getBounds():any{
        return this.win?.getBounds();
    }

    /**
     * 贴边隐藏：若窗口右边缘贴到屏幕右边缘，则几乎整个窗口移出屏幕（仅留 showSize 像素露出）；
     * 左边缘同理。执行后把 hideType 置为对应隐藏状态，并通知股票服务主面板不可见。
     * why：仅在 hideSwitch 开启时生效，且需要能匹配到所在显示器，否则返回。
     */
    hideIfOnScreenBorder(){
        if(this.hideSwitch==false){
            return;
        }

        let bounds:any = this.win?.getBounds();
        //窗口应贴在哪个显示器，就按哪个显示器的边界计算
        let sb = screen.getDisplayMatching(bounds).bounds;
        if(!sb){
            logger.log("sb invalide.")
            return;
        }
        
        //露出屏幕多少像素（用于「抓」回来时的触发热区）
        let showSize = 5;
        //右边缘贴边：把窗口向右移，仅留 showSize 像素在屏幕内
        if(bounds&&(bounds.x+bounds.width)>=(sb.x+sb.width)){
            let tox = sb.x+sb.width - showSize;
            let toy = bounds.y;
            this.setPosition(Math.floor(tox),Math.floor(toy));

            this.hideType = HIDE_TYPE_RIGHT;

            StockUpdateService.setIndexWindowVisible(false);
        //左边缘贴边：把窗口向左移，仅留 showSize 像素在屏幕内
        }else if(bounds&&bounds.x<=sb.x){
            let tox = sb.x+showSize - bounds.width;
            let toy = bounds.y;
            this.setPosition(Math.floor(tox),Math.floor(toy));

            this.hideType = HIDE_TYPE_LEFT;

            StockUpdateService.setIndexWindowVisible(false);
        }
    }

    /**
     * 从贴边状态唤出显示：根据当前 hideType（右/左贴边）把窗口移回屏幕内正常位置，
     * 更新 hideType 为 *_SHOW 状态，通知股票服务主面板可见并强制刷新行情。
     */
    showIfOnScreenBorder(){
        if(this.hideSwitch==false){
            return;
        }

        let bounds:any = this.win?.getBounds();
        if (!bounds){
            logger.log("bounds invalide.")
            return;
        }
        let sb = screen.getDisplayMatching(bounds).bounds;
        //右贴边唤出：窗口右边缘对齐屏幕右边缘
        if(this.hideType == HIDE_TYPE_RIGHT){
        // if(bounds&&(bounds.x+bounds.width)>=(sb.x+sb.width)){
            let tox = sb.x+sb.width - bounds.width;
            let toy = bounds.y;
            this.setPosition(Math.floor(tox),Math.floor(toy));

            this.hideType = HIDE_TYPE_RIGHT_SHOW;

            StockUpdateService.setIndexWindowVisible(true);
            StockUpdateService.forceUpdate();
        //左贴边唤出：窗口左边缘对齐屏幕左边缘
        // }else if(bounds&&bounds.x<=sb.x){
        }else if(this.hideType == HIDE_TYPE_LEFT){
            let tox = sb.x;
            let toy = bounds.y;
            this.setPosition(Math.floor(tox),Math.floor(toy));

            this.hideType = HIDE_TYPE_LEFT_SHOW;

            StockUpdateService.setIndexWindowVisible(true);
            StockUpdateService.forceUpdate();
        }
    }

    /**
     * 将主面板移动到主显示器居中位置。
     */
    setToCenter(){
        let bounds:any = this.win?.getBounds();
        let sb = screen.getPrimaryDisplay().bounds;
        let cx = sb.width/2 - bounds.width/2;
        let cy = sb.height/2 - bounds.height/2;
        cx = Math.floor(cx);
        cy = Math.floor(cy);
        this.setPosition(cx,cy);
    }

    /**
     * 显示窗口（重写基类，额外通知股票服务主面板可见）。
     */
    showOnScreen(){
        super.showOnScreen();

        StockUpdateService.setIndexWindowVisible(true);
    }

    /**
     * 隐藏窗口（重写基类，额外通知股票服务主面板不可见）。
     */
    hideFromScreen(){
        super.hideFromScreen();

        StockUpdateService.setIndexWindowVisible(false);
    }
    
}