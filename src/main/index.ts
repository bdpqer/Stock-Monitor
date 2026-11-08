import { app, BrowserWindow, ipcMain, IpcMainEvent, IpcMainInvokeEvent, shell, webContents, globalShortcut, dialog, Menu, Tray, screen, DownloadItem, systemPreferences } from 'electron'
import { release } from 'os'
import '../extensions/electron_extensions'
import { AddStockWindow } from './pages/AddStockWindow'
import { IndexWindow } from './pages/IndexWindow'
import { LoginWindow } from './pages/LoginWindow'
import { SettingWindow } from './pages/SettingWindow'
import { VipWindow } from './pages/VipWindow'
import { SetCostWindow } from './pages/SetCostWindow'
import WechatPlugin from './plugins/wechat'
import StockApi, { Sug } from './api/StockApi'
import StockService from './service/index'
import local_store, { Config } from './storage/local_store'
import { AppWindow } from './base/app_window'
import path from 'path';
import fs from 'fs';
import moment from 'moment';
const storage = require('electron-json-storage')
import codffect from './api/codffect'
import statistic from './service/statistic'
import logger from './service/logger'
import system from './service/system'
import eldownload from 'electron-dl'
import { InviteWindow } from './pages/InviteWindow'
import { ChartWindow } from './pages/ChartWindow'
import { AdviceWindow } from './pages/AdviceWindow'

const alertDialog:any = {};

process.on('uncaughtException', function (error) {
  let exceptionStr = "uncaughtException:" + error + "|||" + error.stack;
  logger.log(exceptionStr)
  
  if(app.isPackaged){
    codffect.sendException(exceptionStr)
  }
})

async function checkDynConfigs(){
  let data = await codffect.getConfig(app.getVersion())
  
  if(data!=null){
    local_store.applyWith({ dynamicConfig: data });

    setTimeout(async () => {

      let autoUp = data.autoUp;
      if(autoUp==null||autoUp==undefined){
        return;
      }

      let downloadUrl = autoUp.url;
      if (process.platform === 'darwin') {
        downloadUrl = autoUp.mac_url;
      }

      if(!downloadUrl||downloadUrl==""){
        return;
      }

      let releaseNote = autoUp.note;
      let version = autoUp.version;

      if(local_store.config.skipInstall==version){
        logger.log("user skip this version:"+version);
        return;
      }

      if(system.biggerVersion(app.getVersion(),version)){
        logger.log("bigger version.no need update.");
        return;
      }

      if(local_store.config.preparedInstall.version==version){
        let isInstallFileOK = await system.isFileExist(local_store.config.preparedInstall.path);
        if(isInstallFileOK){
          system.showAutoInstall(local_store.config.preparedInstall);
          return;
        }
      }

      let mainWindow:any = indexWindow.win;
      if(mainWindow){
        eldownload.download(mainWindow,downloadUrl,{
          onStarted:item=>{
            logger.log("start:");
            logger.log(item);
          },
          onProgress:item=>{
            logger.log("progress:")
            logger.log(item)
          },
        }).then(async (item:DownloadItem)=>{
          logger.log("download ok:");
          logger.log(item);
          
          let savePath = item.savePath;
          let fileName = item.getFilename();
          if(fileName.endsWith(".zip")){
            let exe:any = await system.unzipInstallFile(savePath);
            exe.note = releaseNote;
            exe.version = version;
            system.showAutoInstall(exe);
          }else{
            //mac直接下载的是dmg
            let dmg:any = {name:fileName,path:savePath};
            dmg.note = releaseNote;
            dmg.version = version;
            system.showAutoInstall(dmg);
          }
        });
      }else{
        logger.log("indexWindow not ready.ignore download.")
      }
      
    }, 10000);
    
  }
}

function checkInviteCode(data:any){
  if(data==null){
    return;
  }

  if(data.NewUser&&data.InviteUserID==0){
    //弹起邀请码弹窗
    openNative(null,"invite",null);
  }
}

async function checkSyncData(){
  if(local_store.config.token==null||local_store.config.token==""){
    return;
  }
  let data = await codffect.syncData(false);
  if(data==null){
    return;
  }
  let sync = false;
  if(local_store.config.synUpdateTime==null){
    sync = true;
  }else if(data.UpdatedTime==""||!data.UpdatedTime){
    sync = true;
  }else{
    let localTime = new Date(local_store.config.synUpdateTime);
    let remoteTime = new Date(data.UpdatedTime);
    // let ifnew = remoteTime>localTime;
    // console.log("ifnew:");
    // console.log(remoteTime);
    // console.log(localTime);
    // console.log(ifnew);
    if(remoteTime&&remoteTime>localTime){
      sync = true;
    }
  }
  
  if(sync){
    let dynConf = JSON.parse(data.Data);
    local_store.applyWith(dynConf)
  }
}

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (process.platform === 'darwin' && app.isPackaged) {
  app.dock.hide();
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'


///创建主页窗口
let indexWindow: IndexWindow = new IndexWindow();
indexWindow.hideSwitch = local_store.config.hideSwitch;
indexWindow.didShowCallBack = function(){
  if(local_store.isVip){
    StockService.forStockUpdate();
  }
  
};

app.whenReady().then(function () {
  logger.log("platform:"+process.platform);
  logger.log("sysVersion:"+process.getSystemVersion());
  logger.log("appVersion:"+app.getVersion());

  statistic.poke("CF.OA", null);
  statistic.poke("CF.IN", null);

  SetUpProxy(local_store.config);

  registerCountDown();
  createTray();
  regiserIpcChannel();

  if(local_store.config.shortCutsSwitch){
    let shortCuts = local_store.config.shortCuts;
    registerGlobalShortcut(shortCuts);
  }
  checkDynConfigs();

  let conf = local_store.config;
  app.setLoginItemSettings({openAtLogin:conf.openAtLogin});

  if (!conf.token) {
    let login = new LoginWindow();
    //监听登录成功
    login.onLoginFinish = (data:any) => {
      checkInviteCode(data);
      checkSyncData();
      indexWindow.show();
      logger.log("login show indexWindow");
    }
    login.show();
    logger.log("login show LoginWindow");
  } else {
    checkSyncData();
    indexWindow.show();
    logger.log("direct show indexWindow");
  }
});

/**
 * 窗口完全关闭后退出应用
 */
app.on('window-all-closed', () => {
  globalShortcut.unregisterAll();
  app.quit();
})

app.on('will-quit', () => {
  // 注销所有快捷键
  globalShortcut.unregisterAll()
})

/**
 * 被创建了第二个实例
 */
app.on('second-instance', () => {
  if (indexWindow.win) {
    // Focus on the main window if the user tried to open another
    if (indexWindow.win.isMinimized()) {
      indexWindow.win.restore()
    }
    indexWindow.win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    indexWindow.show()
  }
})

app.on("before-quit", () =>{
  statistic.poke("WillQuit.App", null);
  local_store.config.save();
})

function registerCountDown() {
  setInterval(() => {
    if (!AppWindow.isOpened("vip")) {
      let countDownTimeSec: any = local_store.config.countDownTimeSec;
      if (countDownTimeSec > 0) {
        countDownTimeSec = countDownTimeSec - 10;
        local_store.applyWith({ countDownTimeSec: countDownTimeSec })
      }
    }
  }, 60 * 1000)
}

function SetUpProxy(config:Config){
    let ps = config.proxySwitch;
    if(ps==false){
      StockApi.cleanProxy();
    }else{
      StockApi.setProxy(ps.proxyHost,ps.proxyPort,ps.proxyUserName,ps.proxyPassWord);
    }
}

/**
 * 注册全局快捷键
 */
function registerGlobalShortcut(shortCuts:any) {
  globalShortcut.unregisterAll();

  // let shortCuts = local_store.config.shortCuts;

  globalShortcut.register(shortCuts.boss, () => {
    let visible = indexWindow.isShow();
    if (visible) {
      indexWindow.hideFromScreen();
    } else {
      indexWindow.showOnScreen();
    }
  })

  globalShortcut.register(shortCuts.adds,()=>{
    openNative(null,"addstock",null);
  })

  let ADJ_CONST = 5;
  if(shortCuts.addo){
    globalShortcut.register(shortCuts.mino,()=>{
      let conf = local_store.config;
      conf.opa = conf.opa - ADJ_CONST;
      if (conf.opa < 0) {
        conf.opa = 0;
      }
      local_store.applyWith({ opa: conf.opa });
    });
  }
  if(shortCuts.mino){
    globalShortcut.register(shortCuts.addo,()=>{
      let conf = local_store.config;
      conf.opa = conf.opa + ADJ_CONST;
      if (conf.opa > 100) {
        conf.opa = 100;
      }
      local_store.applyWith({ opa: conf.opa });
    });
  }

  if(shortCuts.preg){
    globalShortcut.register(shortCuts.preg,()=>{
      indexWindow.win?.webContents.send("preg")
    });
  }

  if(shortCuts.nextg){
    globalShortcut.register(shortCuts.nextg,()=>{
      indexWindow.win?.webContents.send("nextg")
    });
  }
  
}

function openNative(_ipcEvent:any, winname: string, arg: any){
    logger.logDebug("window:size: " + winname + " - " + arg);

    var window: any
    if (winname == "login") {
      window = new LoginWindow();
      window.onLoginFinish = (data:any) => {
        checkInviteCode(data);
        checkSyncData();
        _ipcEvent.sender.send("loginOK");
      };
    } else if (winname == "setting") {
      window = new SettingWindow()
    } else if (winname == "vip") {
      window = new VipWindow()
    } else if (winname == 'addstock') {
      window = new AddStockWindow()
    } else if (winname == "help") {
      window = new SettingWindow()
      window.setRoute("/setting/help")
    } else if (winname == "cost") {
      try{
        let old = AppWindow.winMap[winname];
        if(old && old.win){
          old.win?.focus()
  
          old.setStock(arg);
          old.reload();
        }else{
          window = new SetCostWindow();
          window.setStock(arg);
        }
      }catch(e:any){
        console.log(e)
      }
    } else if (winname == "ext"){
      if(arg.startsWith("https://")||arg.startsWith("http://")){
        let InviteCode = local_store.config.InviteCode;
        if(InviteCode!=null&&InviteCode!=""){
          arg = arg + "&invite=" + InviteCode;
        }
      }
      shell.openExternal(arg);
    } else if (winname == "invite"){
      window = new InviteWindow()
    } else if (winname == "chart"){
      try{
        let old = AppWindow.winMap[winname];
        if(old && old.win){
          old.win?.focus()
  
          old.setStock(arg);
          old.reload();
          // old.setPosition(indexWindow.getBounds())
        }else{
          window = new ChartWindow()
          window.setStock(arg)
          // window.setPosition(indexWindow.getBounds())
        }
      }catch(e:any){
        console.log(e)
      }
    }else if (winname == "advice"){
      window = new AdviceWindow()
    }

    if (window) {
      window.setWinName(winname);

      let old = AppWindow.winMap[winname];
      if (old && old.win) {
        old.win?.focus()
        return
      }
      AppWindow.addWinMap(winname, window)
      window.show();
    }
}

/**
 * 注册 IPc 通道
 */
function regiserIpcChannel() {
  ///注册微信登录状态监听
  WechatPlugin()

  /**
   * 处理打开本地页面
   */
  ipcMain.on("native::open", (_ipcEvent, winname: string, arg: any) => {
    openNative(_ipcEvent,winname,arg);
  })

  /**
   * 调整 Window 大小
   */
  ipcMain.on('window:size', async (ipcEvent, width, height) => {

    let win = BrowserWindow.fromWebContents(ipcEvent.sender)
    if (win == null) {
      return
    }

    logger.log("window:size: " + width + " - " + height);

    let bounds = win.getBounds();
    let ht = indexWindow.hideType;
    if(ht==0||ht==1||ht==4){
      bounds.x = bounds.x;
    }else{
      bounds.x = bounds.x + (bounds.width - width);
    }
    bounds.width = width
    bounds.height = height
    win.setBounds(bounds)
  });
  /**
    * 关闭窗口
    */
  ipcMain.on('close-win', (ipcEvent) => {
    let win = BrowserWindow.fromWebContents(ipcEvent.sender)
    win?.close()
  })

  /**
   * 打开调试模式
   */
  ipcMain.on("open-dev", (ipcEvent) => {
    ipcEvent.sender.openDevTools({ mode: 'detach' })
  })

  /**
   * 统计
   */
  ipcMain.on("statistic", (ipcEvent, eventKey, args) => {
    statistic.poke(eventKey, args)
  })

  /**
   * Api 桥接
   */
  ipcMain.removeHandler('api')
  ipcMain.handle('api', async (ipcEvent: IpcMainInvokeEvent, command: string, arg: any,arg2:any) => {
    logger.logDebug("api: " + command + " - " + arg);

    if (command == "searchStock") {
      statistic.poke("Search",[arg]);

      ///搜索股票
      let sugs = await StockApi.getSugs(arg);

      if(sugs.length<10){
        let sina_sugs = await StockApi.getSinaSugs(arg);
        sugs = sugs.concat(sina_sugs);
      }

      return { "token": arg, "data": sugs };
    } else if (command == 'addStock') {
      //添加一支股票
      return StockService.addStock(ipcEvent, arg)
    } else if (command == "goods") {
      return await codffect.getGoodsInfo()
    } else if (command == "payurl") {
      return await codffect.getPayURL(arg);
    } else if (command == "delStock") {
      return StockService.removeStock(ipcEvent, arg)
    } else if (command == 'topStock') {
      return StockService.setTopStock(ipcEvent, arg)
    } else if (command == 'sortKeys') {
      // 自选股拖拽排序（由渲染层的 drag-sort.js 调用）
      return StockService.sortKeys(arg)
    } else if (command == "paystatus") {
      return await codffect.getPayStatus(arg);
    } else if (command == "userinfo") {
      if (!local_store.config.token) {
        return;
      }

      let data = await codffect.getUserInfo();
      if (data) {
        let userInfo = {
          nickName: data.NickName,
          token: data.Token,
          avatar: data.Avatar,
          validTime: data.ValidTime,
          dueTo: data.DueTo,
          NewUser:data.NewUser,
          InviteUserID:data.InviteUserID,
          InviteCode:data.InviteCode,
        };
        local_store.applyWith(userInfo);
        return userInfo;
      }else{
        return null
      }
    } else if (command == "uploadLogs"){
      return await logger.compressAndSend()
    } else if (command == "isAeroGlassEnabled"){
      // Electron 40 已移除该旧 API，做兼容降级，避免调用时抛错
      const sp = systemPreferences as any
      return typeof sp.isAeroGlassEnabled === 'function' ? sp.isAeroGlassEnabled() : false;
    } else if (command == "shortCut"){
      let newShortCuts = {};
      let shortCuts = local_store.config.shortCuts;

      newShortCuts = Object.assign(newShortCuts,shortCuts);
      newShortCuts = Object.assign(newShortCuts,arg);

      try{
        registerGlobalShortcut(newShortCuts);
      }catch(e:any){
        logger.log(e.stack+"")
        return false;
      }

      local_store.applyWith({
        shortCuts:newShortCuts
      });

      return true;
    } else if(command == "log"){
      logger.log(arg);
    } else if(command == "checkTstock"){
      let sug = new Sug("000001","sh");
      sug.extra = "ZS";
      sug.key = "sh000001";
      sug.market = "A股";
      sug.name = "上证指数";
      return await StockApi.getStocks([sug],false)
    } else if(command == "checkSstock"){
      let sug = new Sug("bc0","qh");
      sug.extra = "sina_qh";
      sug.key = "nf_BC0";
      sug.market = "期货";
      sug.name = "国际铜连续";
      return await StockApi.getSinaStocks([sug])
    } else if (command == "baidu"){
      return await codffect.checkBaidu();
    } else if (command == "openLogDir"){
      return logger.openLogDir();
    } else if (command == "fillInviteCode"){
      let data = await codffect.fillInviteCode(arg)
      if(data.code==200&&data.data==true){
        local_store.applyWith({InviteUserID:1});
      }
      return data;
    } else if (command == "vipDetail"){
      return await codffect.getVipDetail();
    } else if (command == "fenshi"){
      return await StockApi.getFenShiData(arg)
    } else if (command == "getstock"){
      return StockService.getStock(arg);
    } else if(command == "exit"){
      statistic.poke("ExitStill.App", null);

      setTimeout(() => {
          app.quit();  
      }, 600);
    } else if(command == "send_advice"){
      return await codffect.sendAdvice(arg);
    } else if(command == "configPath"){
      return local_store.getPath();
    } else if (command == "backupConfig") {
      // 备份配置：把 electron-json-storage 的配置文件复制到用户指定位置
      const src = path.join(storage.getDataPath(), 'stock-monitor-config.json')
      const stamp = moment().format('YYYYMMDD-HHmmss')
      const result = await dialog.showSaveDialog({
        title: '备份配置',
        defaultPath: path.join(app.getPath('desktop'), `stock-monitor-config-${stamp}.json`),
        filters: [{ name: 'JSON 文件', extensions: ['json'] }],
      })
      if (result.canceled || !result.filePath) return { ok: false, canceled: true }
      try {
        if (!fs.existsSync(src)) {
          fs.writeFileSync(src, JSON.stringify(local_store.config, null, 2))
        }
        fs.copyFileSync(src, result.filePath)
        logger.log('backupConfig -> ' + result.filePath)
        return { ok: true, path: result.filePath }
      } catch (err) {
        logger.log('backupConfig err:' + err)
        return { ok: false, error: String(err) }
      }
    } else if (command == "restoreConfig") {
      // 恢复配置：确认 -> 留存当前配置 -> 覆盖写入 -> 自动重启
      const result = await dialog.showOpenDialog({
        title: '恢复配置',
        properties: ['openFile'] as any,
        filters: [{ name: 'JSON 文件', extensions: ['json'] }],
      })
      if (result.canceled || !result.filePaths || !result.filePaths.length) {
        return { ok: false, canceled: true }
      }
      try {
        const data = JSON.parse(fs.readFileSync(result.filePaths[0], 'utf8'))
        if (typeof data !== 'object' || data === null) {
          return { ok: false, error: '文件内容不是有效的配置' }
        }
        const confirm = await dialog.showMessageBox({
          type: 'warning',
          title: '恢复配置',
          message: '恢复将覆盖当前配置并自动重启应用，确定继续？',
          buttons: ['取消', '确定恢复'],
          defaultId: 0,
          cancelId: 0,
        })
        if (confirm.response !== 1) return { ok: false, canceled: true }

        const dst = path.join(storage.getDataPath(), 'stock-monitor-config.json')
        try {
          if (fs.existsSync(dst)) fs.copyFileSync(dst, `${dst}.bak-${Date.now()}`)
        } catch (backupErr) {
          // 留存失败不阻断恢复
        }
        fs.writeFileSync(dst, JSON.stringify(data, null, 2), 'utf8')
        logger.log('restoreConfig ok, relaunch')
        setTimeout(() => { app.relaunch(); app.exit(0) }, 600)
        return { ok: true }
      } catch (err) {
        logger.log('restoreConfig err:' + err)
        return { ok: false, error: String(err) }
      }
    } else if(command == "testProxy"){
      return codffect.testProxy(arg.proxyHost,arg.proxyPort);
    } else if(command == "exception"){
      if(!app.isPackaged){
        return false;
      }
      
      return await codffect.sendException(arg);
    } else if(command == "gpuInfo"){
      return app.getGPUFeatureStatus();
    } else if (command == "dayk"){
      return await StockApi.getDaykData(arg)
    } else if (command == "mk"){
      return await StockApi.getMkData(arg,arg2)
    }
  })

  /**
   * 配置文件桥接
   */
  ipcMain.removeHandler('config')
  ipcMain.handle('config', async (ipcEvent: IpcMainInvokeEvent, command: string, arg: any) => {
    logger.log("config: " + command + " - " + arg);

    if (command == "get") {
      return local_store.config
    } else if (command == "set") {
      local_store.applyWith(arg);
    } else if (command == "set_reload") {
      local_store.applyWith(arg);

      if(arg.openAtLogin==true){
        app.setLoginItemSettings({openAtLogin:true})
      }else if(arg.openAtLogin==false){
        app.setLoginItemSettings({openAtLogin:false})
      }

    } else if (command == "set_alias") {
      local_store.setAlias(arg.key, arg.alias);
    } else if (command == "getversion") {
      return app.getVersion();
    } else if (command == "set_cost") {
      local_store.setCost(arg.key, arg.price, arg.amount);
    } else if (command == "set_alert") {
      statistic.poke("Cost.Alert.CK",arg);

      local_store.setAlert(arg.key, arg);
    } else if(command == "set_shortcuts_switch"){
      if(arg.shortCutsSwitch==true){
        globalShortcut.unregisterAll();

        let shortCuts = local_store.config.shortCuts;
        registerGlobalShortcut(shortCuts);
      }else if(arg.shortCutsSwitch==false){
        globalShortcut.unregisterAll();
      }

      local_store.applyWith(arg);
    }
  })

  /**
   * 改位置
   */
  ipcMain.handle('window', async (ipcEvent: IpcMainInvokeEvent, command, arg: any) => {
    logger.logDebug("window: " + command + " - " + arg);

    const win = BrowserWindow.fromWebContents(ipcEvent.sender);
    if (win == null) {
      return null
    }
    if (command == 'getpos') {
      let pos = win?.getPosition();
      return { x: pos[0], y: pos[1] }
    } else if (command == 'setpos') {

      if (indexWindow.win==win){
        indexWindow.hideType = 0;
      }
      
      let bounds = win.getBounds();
      let sf = screen.getDisplayMatching(bounds).scaleFactor;
      //这里是想表达不等于整数，临时这么写
      if(sf!==1&&sf!==2&&sf!==3){
        bounds.x = arg.x;
        bounds.y = arg.y;
        win?.setBounds(bounds);
  
        let newBounds = win.getBounds();
        let diffW = newBounds.width - bounds.width;
        let diffH = newBounds.height - bounds.height;
        if (diffW <= 2 && diffH <= 2 && diffW >= 0 && diffH >= 0) {
          bounds.width -= diffW;
          bounds.height -= diffH
          win?.setBounds(bounds);
        }
      }else{
        win.setPosition(Math.floor(arg.x),Math.floor(arg.y));
      }
      return true
    } else if (command == "checkhide" && win == indexWindow.win) {
      indexWindow.hideIfOnScreenBorder()
    } else if (command == "checkshow" && win == indexWindow.win) {
      statistic.poke("IW.mouseIn", null);

      indexWindow.showIfOnScreenBorder()
    } else if(command == "savebounds"){
      let bounds = win.getBounds();
      // console.log(bounds);
      if(arg!="chart"&&JSON.stringify(bounds)==JSON.stringify(local_store.config.bounds)){
        console.log("bounds not change.dont save.");
        return;
      }
      local_store.editWith((cfg) => {
          if(arg=="chart"){
            cfg.chartBounds = bounds
          }else{
            cfg.bounds = bounds
          }
      })
    } else if(command == "contextmenu"){
      // let gn = arg;
      // const contextMenu = Menu.buildFromTemplate([
      //   {
      //     label: "左移", click: async function () {
      //       let gps = local_store.config.groups;
            
      //     }
      //   },
      //   {
          
      //     label: "右移", click: async function () {
            
      //     }
      //   },
      // ])
      // contextMenu.popup({window:indexWindow.win!});
    }
  });
}

var tray: any;
function createTray() {
  const assetsPath = app.isPackaged ? path.join(process.resourcesPath, "build/icons") : "build/icons";
  let ptoi = assetsPath + "/24x24.png";
  logger.log("path icon:" + ptoi);
  tray = new Tray(ptoi)

  const contextMenu = Menu.buildFromTemplate([
    {
      
      label: "打开设置页面", click: async function () {
        openNative(null,"setting",null)
      }
    },
    {
      
      label: "重置软件", click: async function () {

        const options: any = {
          type: 'info',
          title: '重置软件？',
          message: "重置软件？重置后所有配置会恢复到初始状态.",
          buttons: ['否', '是']
        }
        let index = await dialog.showMessageBox(options)
        
        if (index.response == 1) {
          local_store.restore();

          SetUpProxy(local_store.config);
        }
      }
    },
    {
      label: "模式切换", click: function () {
        indexWindow.win?.webContents.send("uimodechange")
      }
    },
    {
      label: '面板居中', click:async function () {
        const options: any = {
          type: 'info',
          title: '找不到面板了？',
          message: "该行为会把你面板放到屏幕中间并且显示出来",
          buttons: ['否', '是']
        }
        let index = await dialog.showMessageBox(options)
        
        if (index.response == 1) {
          indexWindow.setToCenter();
          indexWindow.showOnScreen();
        }
      }
    },
    {
      label: '上传日志', click:async function () {
        const options: any = {
          type: 'info',
          title: '是否上传日志？',
          message: "该行为会把你的调试日志上传给开发者帮助分析问题。",
          buttons: ['否', '是']
        }
        let index = await dialog.showMessageBox(options)
        
        if (index.response == 1) {
          await logger.compressAndSend()
        }
      }
    },
    {
      label: '退出', click: function () {
        if(local_store.checkFirstLaunchAndQuickExit()){
          statistic.poke("QuickExit.IM", null);

          openNative(null,"advice",null);
        }else{
          statistic.poke("CF.OUT", null);

          setTimeout(() => {
            app.quit();  
          }, 700);
        }
      }
    },
  ])
  tray.setToolTip('Stock-monitor')
  tray.setContextMenu(contextMenu)
  tray.on("double-click", function () {
    indexWindow.showIfOnScreenBorder();
    indexWindow.showOnScreen();
  })

  // hide menu for Mac
  Menu.setApplicationMenu(null)
}

local_store.on('onConfig', async (config: Config,diffKeys:any)=>{
  let syncData = false;
  for(let i in diffKeys){
    let k = diffKeys[i];
    if(k=="keys"||k=="cost"||k=="alias"||k=="alertInfos"||k=="groups"){
      syncData = true;
    }
  }

  if(syncData){
    if(local_store.config.token&&local_store.config.token!=""){
      let ret = await codffect.syncData(true);
      config.applyWith({synUpdateTime:ret})
    }
  }

  if(diffKeys.length>=1&&diffKeys[0]=="proxySwitch"){
    SetUpProxy(config);
  }
})

StockService.onEvent("alertPrice",async function(arg:any){
  if(alertDialog[arg.key]){
    logger.log(arg.key+" already alert.")
    return;
  }

  alertDialog[arg.key] = true;

  const options: any = {
    type: 'info',
    title: '提醒',
    message: arg.text,
    buttons: ['知道了',"不再提醒"]
  }
  let index = await dialog.showMessageBox(options)
  
  if (index.response == 1) {
    local_store.setAlert(arg.key,{key:arg.key,at:arg.at,v:false})
  }

  delete alertDialog[arg.key];
})