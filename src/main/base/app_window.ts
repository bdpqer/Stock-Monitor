import { app, BrowserWindow, BrowserWindowConstructorOptions, Menu } from "electron";
import { join } from 'path';
import logger from "../service/logger";
import statistic from "../service/statistic";
import local_store from "../storage/local_store";
import { screen } from "electron";

/**
 * 应用窗口
 */
export abstract class AppWindow {

    winName: string | null = null;

    static winMap: any = {};

    static addWinMap(tag: string, window: AppWindow) {
        this.winMap[tag] = window
    }

    static isOpened(tag: string):any{
        if(this.winMap[tag]){
            return true;
        }else{
            return false;
        }
    }

    public didShowCallBack:any = null;

    ///窗口属性
    win: BrowserWindow | null = null;

    setWinName(winName:string){
        this.winName = winName;
    }
    getWinName():string|null{
        return this.winName;
    }

    showOnScreen(){
        logger.log("showOnScreen")

        //这里这么写是为了解决window的transparet为true时，electron的bug，不然窗口出现时，会闪一下。
        this.win?.setOpacity(0);
        this.win?.show();
        setTimeout(() => {
            this.win?.setOpacity(local_store.alpha)
        }, 1000/50);

        if(this.didShowCallBack){
            this.didShowCallBack();
        }
    }
    hideFromScreen(){
        logger.log("hideFromScreen")
        this.win?.hide();
    }
    isShow(){
        return this.win?.isVisible();
    }

    /**
     * 为了解决不同分辨率setposition，窗口大小会变化
     * 
     */
    setPosition(x:number,y:number){
        
        let bounds:any = this.win?.getBounds();
        let sf = screen.getDisplayMatching(bounds).scaleFactor;
        //这里是想表达不等于整数，临时这么写
        if(sf!==1&&sf!==2&&sf!==3){
          bounds.x = x;
          bounds.y = y;
          this.win?.setBounds(bounds);
    
          let newBounds:any = this.win?.getBounds();
          let diffW = newBounds.width - bounds.width;
          let diffH = newBounds.height - bounds.height;
          if (diffW <= 2 && diffH <= 2 && diffW >= 0 && diffH >= 0) {
            bounds.width -= diffW;
            bounds.height -= diffH
            this.win?.setBounds(bounds,true);
          }
        }else{
          this.win?.setPosition(Math.floor(x),Math.floor(y),true);
        }

    }

    /**
    * 显示
    */
    show(parent: BrowserWindow | null = null) {
        this.createWindow(parent)

        statistic.poke("WindowShow",{name:this.winName});
    }
    /**
     * 创建窗口
     */
    createWindow(parent: any) {
        if (this.win) {
            return;
        }

        var options: BrowserWindowConstructorOptions = {
            useContentSize: true,
            show: false,
            resizable: false,
            parent: parent,
            movable: true,
            minimizable: false,
            maximizable: false,
            webPreferences: {
                preload: join(__dirname, '../preload/index.cjs'),
                nodeIntegration: true,
                contextIsolation: false,
                devTools: true,
            },
        }
        Menu.setApplicationMenu(null)
        ///配置窗口参数
        this.configWindow(options);
        /**
         * 登录窗体创建
         */
        this.win = new BrowserWindow(options)


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
            let index = Object.values(AppWindow.winMap).findIndex((v) => v == this);
            if(index >= 0){
                AppWindow.winMap[Object.keys(AppWindow.winMap)[index]] = null
            }
            this.onWindowClosed(this.win!)
            this.win = null
        });
    }

    /**
     * 处理窗口
     * @param bounds 
     */
    onWindowBoundsChanged(bounds: Electron.Rectangle | undefined) {

    }
    /**
     * 窗口创建成功
     * @param win 
     */
    abstract onWindowCreated(win: BrowserWindow): void;
    /**
     * 配置窗口
     * @param options 
     */
    configWindow(options: BrowserWindowConstructorOptions) {
    }
    /**
     * 窗口显示时回调
     */
    onWindowShown() {
        if (!app.isPackaged) {
            this.win?.webContents.openDevTools({ mode: 'detach' })
        }
    }
    /**
     * 窗口关闭时回调
     */
    onWindowClosed(win: BrowserWindow) {
        statistic.poke("WindowClose",{name:this.winName});
    }

    onWindowBlur(){
    }
}