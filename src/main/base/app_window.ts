import { app, BrowserWindow, BrowserWindowConstructorOptions, Menu } from "electron";
import { join } from 'path';
import logger from "../service/logger";
import statistic from "../service/statistic";
import local_store from "../storage/local_store";
import { screen } from "electron";

/**
 * 模块级注释：窗口基类 AppWindow
 *
 * 职责与角色：
 * 本模块是本项目「多窗口体系」的抽象基类，所有业务窗口（主面板、添加股票、
 * 图表、登录、设置等）都继承自 AppWindow。它统一封装了：
 *   1. 窗口单例注册表 winMap —— 通过静态方法 addWinMap/isOpened 维护已打开窗口，
 *      供上层（openNative 统一创建/单例管理）判断某窗口是否已存在。
 *   2. 窗口完整生命周期 —— createWindow / show / onWindowCreated / onWindowShown /
 *      onWindowClosed 等钩子方法，子类只需重写 configWindow 等回调即可定制窗口。
 *   3. 贴边隐藏相关能力 —— showOnScreen / hideFromScreen / isShow / setPosition，
 *      用于无边框置顶面板在屏幕边缘的隐藏与唤出显示。
 *   4. 分辨率 scaleFactor 适配 —— setPosition 针对不同系统缩放比例修正窗口像素偏移。
 *   5. 窗口事件回调 —— move / resize / blur / close 事件统一转发到子类钩子。
 */
export abstract class AppWindow {

    winName: string | null = null;

    /**
     * 窗口单例注册表（静态）：key 为窗口标识 tag（字符串），value 为对应的 AppWindow 实例。
     * 用于跨窗口判断「某类窗口是否已打开」，实现单例管理。
     */
    static winMap: any = {};

    /**
     * 注册窗口实例到单例表。
     * @param tag 窗口标识，作为 winMap 的 key
     * @param window 已创建的窗口实例
     */
    static addWinMap(tag: string, window: AppWindow) {
        this.winMap[tag] = window
    }

    /**
     * 判断指定 tag 的窗口是否已经打开（存在于单例表中）。
     * @param tag 窗口标识
     * @returns 已打开返回 true，否则返回 false
     */
    static isOpened(tag: string):any{
        if(this.winMap[tag]){
            return true;
        }else{
            return false;
        }
    }

    ///窗口显示（show）完成后的回调，由子类按需赋值
    public didShowCallBack:any = null;

    ///窗口属性：当前窗口对应的 Electron BrowserWindow 实例
    win: BrowserWindow | null = null;

    ///设置窗口名（用于统计埋点、日志）
    setWinName(winName:string){
        this.winName = winName;
    }
    ///获取窗口名
    getWinName():string|null{
        return this.winName;
    }

    /**
     * 将窗口显示到屏幕（唤醒显示）。
     * why：先 setOpacity(0) 再 show，是为了规避 Electron 在窗口透明(transparent=true)
     * 场景下的 bug——直接 show 会闪一下白屏，因此先以 0 透明度显示，再延迟恢复目标透明度。
     * 延迟时长 1000/50 = 20ms（约一帧）。
     */
    showOnScreen(){
        logger.log("showOnScreen")

        //这里这么写是为了解决window的transparet为true时，electron的bug，不然窗口出现时，会闪一下。
        this.win?.setOpacity(0);
        this.win?.show();
        setTimeout(() => {
            this.win?.setOpacity(local_store.alpha)
        }, 1000/50);

        //若子类注册了显示回调，则在此触发
        if(this.didShowCallBack){
            this.didShowCallBack();
        }
    }
    /**
     * 将窗口从屏幕隐藏（贴边隐藏用）。
     */
    hideFromScreen(){
        logger.log("hideFromScreen")
        this.win?.hide();
    }
    /**
     * 判断窗口当前是否可见。
     * @returns 可见返回 true，否则 false（窗口尚未创建时返回 undefined）
     */
    isShow(){
        return this.win?.isVisible();
    }

    /**
     * 设置窗口位置（带分辨率缩放适配）。
     * why：在不同显示器缩放比例(scaleFactor)下直接 setPosition 会导致窗口实际尺寸发生
     * 偏移/变化，因此这里针对非整数缩放系数做额外的 bounds 校正。
     * @param x 目标逻辑横坐标
     * @param y 目标逻辑纵坐标
     */
    setPosition(x:number,y:number){
        
        let bounds:any = this.win?.getBounds();
        //获取窗口当前所在显示器（根据 bounds 匹配）的缩放系数
        let sf = screen.getDisplayMatching(bounds).scaleFactor;
        //这里是想表达不等于整数，临时这么写
        if(sf!==1&&sf!==2&&sf!==3){
          //非标准整数缩放（如 1.25/1.5 等）时，用 setBounds 整体设置位置
          bounds.x = x;
          bounds.y = y;
          this.win?.setBounds(bounds);
    
          //重新读取窗口实际 bounds，计算设置后宽高被系统「整除缩放」造成的误差
          let newBounds:any = this.win?.getBounds();
          let diffW = newBounds.width - bounds.width;
          let diffH = newBounds.height - bounds.height;
          //误差在 0~2 像素内，回退掉这部分误差，使窗口尺寸与预期一致（第二个参数 true 表示带动画）
          if (diffW <= 2 && diffH <= 2 && diffW >= 0 && diffH >= 0) {
            bounds.width -= diffW;
            bounds.height -= diffH
            this.win?.setBounds(bounds,true);
          }
        }else{
          //标准缩放系数下直接按整数坐标设置位置（Math.floor 取整避免亚像素坐标）
          this.win?.setPosition(Math.floor(x),Math.floor(y),true);
        }

    }

    /**
    * 显示窗口：确保窗口已创建后 show，并上报「窗口展示」埋点统计。
    * @param parent 父窗口（可为 null）
    */
    show(parent: BrowserWindow | null = null) {
        this.createWindow(parent)

        statistic.poke("WindowShow",{name:this.winName});
    }
    /**
     * 创建窗口：核心生命周期入口。
     * why：若 this.win 已存在则直接返回，保证「单例」——不会重复创建同一窗口。
     * 创建完成后立即绑定 ready-to-show / move / blur / resize / close 等事件，
     * 并转发到对应子类钩子（onWindowCreated / onWindowBoundsChanged / onWindowBlur / onWindowClosed）。
     * @param parent 父窗口
     */
    createWindow(parent: any) {
        if (this.win) {
            return;
        }

        //窗口默认构造参数（子类可在 configWindow 中覆盖）
        var options: BrowserWindowConstructorOptions = {
            useContentSize: true,   // width/height 按内容区尺寸计算
            show: false,            // 先不显示，等 ready-to-show 后再显示
            resizable: false,       // 默认不可缩放
            parent: parent,         // 父窗口
            movable: true,          // 可移动
            minimizable: false,     // 不可最小化
            maximizable: false,     // 不可最大化
            webPreferences: {
                preload: join(__dirname, '../preload/index.cjs'), // 预加载脚本，注入渲染层桥接
                nodeIntegration: true,      // 允许渲染层直接使用 Node
                contextIsolation: false,    // 关闭上下文隔离，便于渲染层直接访问主进程暴露的对象
                devTools: true,             // 允许打开开发者工具
            },
        }
        Menu.setApplicationMenu(null)
        ///配置窗口参数
        this.configWindow(options);
        /**
         * 登录窗体创建
         */
        this.win = new BrowserWindow(options)


        //通知子类窗口已创建（子类在此加载路由、绑定服务）
        this.onWindowCreated(this.win)
        /**
         * 等待响应
         */
        this.win?.once('ready-to-show', () => {
            this.win?.show()
            this.onWindowShown();
        })

        /**
         * 窗口移动了
         */
        this.win?.on('move', () => {
            this.onWindowBoundsChanged(this.win?.getBounds())
        });

        //窗口失去焦点
        this.win?.on('blur',()=>{
            this.onWindowBlur();
        })

        /**
         * 大小变化了
         */
        this.win?.on('resize', () => {
            this.onWindowBoundsChanged(this.win?.getBounds())
        })
        /**
         * 窗口关闭
         */
        this.win?.on('close', (event) => {
            //从单例表中移除当前窗口实例（将匹配到的槽位置为 null）
            let index = Object.values(AppWindow.winMap).findIndex((v) => v == this);
            if(index >= 0){
                AppWindow.winMap[Object.keys(AppWindow.winMap)[index]] = null
            }
            this.onWindowClosed(this.win!)
            this.win = null
        });
    }

    /**
     * 处理窗口位置/尺寸变化（子类可重写，例如持久化窗口 bounds）。
     * @param bounds 变化后的窗口边界
     */
    onWindowBoundsChanged(bounds: Electron.Rectangle | undefined) {

    }
    /**
     * 窗口创建成功回调（抽象方法，子类必须实现：加载路由、绑定业务服务等）。
     * @param win 创建完成的 BrowserWindow
     */
    abstract onWindowCreated(win: BrowserWindow): void;
    /**
     * 配置窗口参数（子类重写以设定具体窗口的尺寸/标题/无边框/置顶等）。
     * @param options 待修改的窗口构造参数
     */
    configWindow(options: BrowserWindowConstructorOptions) {
    }
    /**
     * 窗口显示时回调（默认在开发环境自动打开开发者工具）。
     */
    onWindowShown() {
        if (!app.isPackaged) {
            this.win?.webContents.openDevTools({ mode: 'detach' })
        }
    }
    /**
     * 窗口关闭时回调（默认上报「窗口关闭」埋点统计）。
     * @param win 被关闭的 BrowserWindow
     */
    onWindowClosed(win: BrowserWindow) {
        statistic.poke("WindowClose",{name:this.winName});
    }

    ///窗口失去焦点回调（子类可重写，例如贴边隐藏逻辑）
    onWindowBlur(){
    }
}