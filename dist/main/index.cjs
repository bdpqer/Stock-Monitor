var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/main/index.ts
var import_electron11 = require("electron");
var import_os = require("os");

// src/extensions/electron_extensions.ts
var import_electron = require("electron");
var import_path = require("path");
import_electron.BrowserWindow.prototype.loadWithRoute = function(url) {
  const host = process.env["VITE_DEV_SERVER_HOST"];
  const port = process.env["VITE_DEV_SERVER_PORT"];
  if (!import_electron.app.isPackaged && host && port) {
    this.loadURL(`http://${host}:${port}#${url}`);
    return;
  }
  this.loadURL("file://" + (0, import_path.join)(__dirname, "../renderer/index.html") + `#${url}`);
};

// src/main/base/app_window.ts
var import_electron3 = require("electron");
var import_path2 = require("path");

// src/main/service/logger.ts
var import_electron_log = __toESM(require("electron-log"));

// src/main/storage/local_store.ts
var import_events = __toESM(require("events"));
var import_moment = __toESM(require("moment"));
var import_electron2 = require("electron");
var import_crypto = require("crypto");
var storage = require("electron-json-storage");
var { machineIdSync } = require("node-machine-id");
function safeMachineId() {
  try {
    return machineIdSync(true);
  } catch (err) {
    logger_default.log("machineIdSync unavailable, fallback to local uuid: " + err);
    return "offline-" + (0, import_crypto.randomUUID)();
  }
}
var eventEmmiter = new import_events.default();
var Config = class {
  constructor() {
    // ===== 显示 / 表格 =====
    this.fontSize = 14;
    // 字体大小（px）
    this.column = [0, 1, 2, 3, 4, 9];
    // 表格要显示的列的索引（对应 data_type 里的 value）
    this.opa = 100;
    // 窗口不透明度（0~100）
    this.model = "nm";
    // 界面模式：nm=正常，sm=精简（渲染层切换）
    this.themeMode = "classic";
    // 主题：classic（红涨绿跌）/ 自定义
    // 背景/字体色（新版 RGB + alpha 分离；old config 的 backColor/textColor 为旧格式）
    this.backColorNew = "#FFFFFF";
    this.backAlpha = 255;
    this.textColorNew = "#000000";
    this.textAlpha = 255;
    this.backColor = "rgba(255,255,255,255)";
    // 旧版背景色（兼容保留）
    this.textColor = "rgba(90,90,90,255)";
    // 旧版字体色（兼容保留）
    // ===== 窗口 =====
    this.bounds = null;
    // 主面板窗口位置/尺寸（null 表示未记录，用默认）
    this.chartBounds = null;
    // 图表窗口位置
    this.hideSwitch = true;
    // 是否启用「贴边自动隐藏」
    this.windowTransparent = false;
    // 是否透明窗口
    this.openAtLogin = true;
    // 是否开机自启
    // ===== 自选股数据 =====
    this.keys = [];
    // 自选股列表（Sug：含 code/marketCode/key/name 等）
    this.alias = {};
    // 股票别名：key -> 别名
    this.cost = {};
    // 成本：key -> {price, amount, date}
    this.groups = [];
    // 分组列表（字符串数组）
    this.groupsSwitch = true;
    // 是否启用分组栏
    // ===== 提醒 =====
    this.alertInfos = {};
    // 价格提醒：key -> {downalert_switch/price/text, upalert_*...}
    this.alertsKey = {};
    // 已读提醒标记：key -> true（渲染层用）
    // ===== 快捷键 =====
    this.shortCutsSwitch = true;
    // 是否启用全局快捷键
    this.shortCuts = { "boss": "Alt+`", "adds": "Ctrl+t", "addo": "Ctrl+]", "mino": "Ctrl+[" };
    // 老板键/添加/加减透明度/分组切换
    // ===== 盈亏 =====
    this.profitMode = "ap";
    // 盈亏显示模式：ap=金额+百分比，a=仅金额，其他=仅百分比
    this.profiteTotal = false;
    // 是否显示「合计/当日」汇总（离线版强制 true）
    this.freqWhenHide = null;
    // 面板隐藏时的轮询间隔（秒），null 用默认 15s
    // ===== 账号（离线版基本弃用）=====
    this.uuid = safeMachineId();
    // 设备唯一标识（离线版退化为本地 UUID）
    this.token = null;
    // 登录 token
    this.nickName = "";
    this.avatar = null;
    this.validTime = null;
    // 会员有效期
    this.dueTo = null;
    this.NewUser = true;
    this.InviteUserID = 0;
    this.clickPromote = false;
    this.InviteCode = null;
    this.countDownTimeSec = 86400;
    // 会员倒计时（秒，在线版存档）
    // ===== 升级 / 云端（在线版弃用）=====
    this.dynamicConfig = {};
    // 云端下发的动态配置
    this.synUpdateTime = null;
    // 上次云端同步时间
    this.skipInstall = "";
    // 用户选择「跳过此版本」的版本号
    this.preparedInstall = {};
    // 已下载待安装的升级包信息
    // ===== 代理 =====
    this.proxySwitch = false;
    // false 或 {proxyHost,proxyPort,proxyUserName,proxyPassWord}
    // ===== 调试 =====
    this.debugSwitch = false;
  }
  // 是否开启 debug 日志（logger.logDebug 依据此开关）
  /**
   * 是否为Vip
   * 离线版：会员校验本地恒真，避免依赖云端账号体系与有效期字段。
   */
  isVip() {
    return true;
  }
  /**
   * 添加 Stock
   * @param st 
   * @returns 
   */
  addStock(st) {
    let index = this.keys.findIndex((value, index2) => {
      return value.code == st.code && value.marketCode == st.marketCode;
    });
    if (index >= 0) {
      return false;
    }
    this.keys.push(st);
    return true;
  }
  /**
   * 置顶股票
   * @param st 
   */
  setTopStock(st) {
    let index = this.keys.findIndex((value, index2) => {
      return value.code == st.code && value.marketCode == st.marketCode;
    });
    if (index >= 0) {
      this.keys.splice(index, 1);
      this.keys.unshift(st);
    }
  }
  /**
   * 移除 Stock
   * @param st 
   */
  removeStock(st) {
    let index = this.keys.findIndex((value, index2) => {
      return value.code == st.code && value.marketCode == st.marketCode;
    });
    if (index >= 0) {
      this.keys.splice(index, 1);
    }
  }
  /**
   * 设置别名
   * @param code 
   * @param alias 
   */
  setAlias(code, name) {
    this.alias[code] = name;
  }
  /**
   * 设置某支股票的成本价与持仓数量（key 为股票 marketCode+code）。
   * price/amount 允许为 null：为 null 时不更新该项，仅更新传入的那一项；
   * 同时记录「今天」为成本基准日，用于当日盈亏计算（见 stock.ts processData）。
   */
  setCost(key, price, amount) {
    let old = this.cost[key];
    let now = /* @__PURE__ */ new Date();
    let nowStr = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
    if (!old) {
      this.cost[key] = { price, amount, date: nowStr };
    } else {
      if (price != null && price != void 0) {
        old.price = price;
        old.date = nowStr;
      }
      if (amount != null && amount != void 0) {
        old.amount = amount;
      }
      this.cost[key] = old;
    }
  }
  /**
   * 设置某支股票的价格提醒。
   * v 结构：{ key, at: 提醒类型(downalert_switch/upalert_switch), v: 值/开关 }。
   * v.v 为空串或 false 表示「关闭该提醒」，从 alertInfos[key] 里删掉对应类型；
   * 否则把 v.v 写入该类型。
   */
  setAlert(key, v) {
    let ai = this.alertInfos[key];
    if (!ai) {
      ai = {};
    }
    if (v.v == "" || v.v == false) {
      delete ai[v.at];
    } else {
      ai[v.at] = v.v;
    }
    console.log(ai);
    this.alertInfos[key] = ai;
  }
  /**
   * 应用一个 Object
   * @param obj 
   */
  applyWith(obj) {
    Object.assign(this, obj);
    return this;
  }
  /**
   * 保存到磁盘。
   * 通过与上次快照 oldConfig 逐字段 JSON 对比，得到本次「变化了哪些 key」（diffKeys），
   * 然后写盘，并通过 onConfig 事件把这些变化广播给所有监听者，
   * 让主进程/渲染层只针对变化字段做增量响应（而非全量重刷）。
   */
  save() {
    const newConfig = appConfig;
    if (newConfig) {
      let diffKeys = [];
      Object.keys(newConfig).forEach((key) => {
        if (JSON.stringify(oldConfig[key]) != JSON.stringify(newConfig[key])) {
          diffKeys.push(key);
        }
      });
      oldConfig = JSON.parse(JSON.stringify(newConfig));
      storage.set("stock-monitor-config", appConfig, function(error) {
        if (error) {
          logger_default.log("save config err:");
          logger_default.log(error + "");
          logger_default.log(error.stack);
        }
      });
      eventEmmiter.emit("onConfig", appConfig, diffKeys);
    }
  }
};
var oldConfig = storage.getSync("stock-monitor-config") ?? {};
var appConfig;
var local_store_default = {
  /** 获取 electron-json-storage 的数据目录路径 */
  getPath() {
    return storage.getDataPath();
  },
  /**
   * 判断「首次启动后 10 分钟内快速退出」。
   * 用于托盘菜单「退出」时的分流：快速退出 → 引导到反馈窗口（advice），
   * 正常退出 → 直接退出。通过 firstLaunch 时间戳与当前时间差判断。
   */
  checkFirstLaunchAndQuickExit() {
    let fl = storage.getSync("firstLaunch");
    if (fl.time == void 0 || fl.time == null) {
      storage.set("firstLaunch", { time: (0, import_moment.default)().toDate() }, null);
      return false;
    } else {
      let launch = (0, import_moment.default)(fl.time);
      let exit = (0, import_moment.default)();
      var duration = import_moment.default.duration(exit.diff(launch));
      if (duration.asMinutes() < 10) {
        return true;
      } else {
        return false;
      }
    }
  },
  /**
   * 离线版启动流程：app ready 后把存储目录切到 userData 并重建配置单例。
   *
   * 模块顶层读取发生在 app ready 之前，electron-json-storage 会使用默认的
   * `userData/storage/` 子目录；而实际配置保存在 userData 根目录。若不重置，
   * 会读到一份空配置（token 为空、无自选股、profiteTotal 为 false），
   * 进而误入已被禁用的登录窗口、且主界面不显示行情。
   */
  reloadFromUserData() {
    storage.setDataPath(import_electron2.app.getPath("userData"));
    appConfig = void 0;
    const cfg = this.config;
    oldConfig = JSON.parse(JSON.stringify(cfg));
    return cfg;
  },
  /** 恢复出厂配置：用全新的默认 Config 覆盖当前所有配置 */
  restore() {
    this.applyWith(new Config());
  },
  /**
   * 「读-改-存」的原子编辑接口：fn 接收配置单例并就地修改。
   * 只要 fn 返回的不是 false，就自动触发一次 save()。
   * 大部分 setXxx/applyWith 都是它的薄封装。
   */
  editWith(fn) {
    let ret = fn(this.config);
    if (ret != false) {
      this.config.save();
    }
    return ret;
  },
  /**
   * 附加一个Object
   * @param obj 
   */
  applyWith(obj) {
    this.editWith((config) => {
      config.applyWith(obj);
    });
  },
  /**
   * 是否为Vip
   */
  get isVip() {
    return this.config.isVip();
  },
  /**
   * 由 opa（0~100）换算成 Electron 窗口 setOpacity 需要的 alpha（0.05~1.0）。
   * 映射规则：opa=0 → 0.05，opa=100 → 1.0，中间线性。
   * 之所以不直接用 opa/100，是为了让「最透明」时仍保留 0.05 不至于完全不可见。
   */
  get alpha() {
    return this.config.opa * 0.95 / 100 + 0.05;
  },
  /**
   * 添加股票
   * @param sug 
   */
  addStock(sug) {
    return this.editWith((cfg) => cfg.addStock(sug));
  },
  removeStock(sug) {
    return this.editWith((cfg) => cfg.removeStock(sug));
  },
  setTopStock(sug) {
    return this.editWith((cfg) => cfg.setTopStock(sug));
  },
  setAlias(code, name) {
    return this.editWith((cfg) => cfg.setAlias(code, name));
  },
  setCost(key, price, amount) {
    return this.editWith((cfg) => cfg.setCost(key, price, amount));
  },
  setAlert(key, v) {
    return this.editWith((cfg) => cfg.setAlert(key, v));
  },
  on(event, listener) {
    eventEmmiter.on(event, listener);
  },
  removeListener(event, listener) {
    eventEmmiter.removeListener(event, listener);
  },
  /**
   * 配置单例的懒加载 getter。
   * 首次访问时：用默认字段 + storage 里已持久化的配置合并出 appConfig 单例；
   * 之后一直返回同一实例（内存态），修改后靠 save() 写盘。
   * 这里还做了「升级用户」的兼容：旧配置可能没有 preg/nextg 两个分组切换
   * 快捷键，此处补上默认值，避免 registerGlobalShortcut 时未定义。
   */
  get config() {
    if (appConfig == null) {
      appConfig = new Config().applyWith(storage.getSync("stock-monitor-config"));
      let sc = appConfig.shortCuts;
      if (!sc["preg"]) {
        sc["preg"] = "Alt+q";
      }
      if (!sc["nextg"]) {
        sc["nextg"] = "Alt+w";
      }
      return appConfig;
    }
    return appConfig;
  }
};

// src/main/service/logger.ts
import_electron_log.default.transports.file.maxSize = 1002430;
import_electron_log.default.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}";
var date = /* @__PURE__ */ new Date();
var datestr = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
import_electron_log.default.transports.file.fileName = datestr + ".log";
console.log("logger Path:" + import_electron_log.default.transports.file.getFile().path);
var logger_default = {
  /**
   * 调试日志：仅当本地配置 debugSwitch 为 true 时才输出，避免默认情况刷屏。
   * @param msg 日志内容（任意类型，最终交给 log() 处理）
   */
  logDebug(msg) {
    if (local_store_default.config.debugSwitch) {
      this.log(msg);
    }
  },
  /**
   * 通用日志：对象先 JSON 序列化再打印，统一加 [Logger] 前缀，方便在控制台区分来源。
   * @param msg 日志内容（对象会被序列化，字符串/数字直接输出）
   */
  log(msg) {
    if (typeof msg === "object" && msg !== null) {
      msg = JSON.stringify(msg);
    }
    console.log("[Logger]", msg);
  },
  /**
   * 打开日志所在目录：离线版不写日志文件，故无目录可打开，恒返回 null。
   */
  openLogDir() {
    return null;
  },
  /**
   * 获取日志文件路径：离线版恒返回 null。
   */
  getLogPath() {
    return null;
  },
  /**
   * 压缩并上传日志：日志上传已禁用，恒返回 null。
   */
  async compressAndSend() {
    return null;
  }
};

// src/main/service/statistic.ts
var statistic_default = {
  /**
   * 埋点上报（离线版空实现）。
   * 主进程各处通过 statistic.poke(eventKey, params) 记录用户行为；离线版函数体为空，
   * 不真正上报，也不会产生任何网络请求或额外开销。
   * @param eventKey 事件标识（字符串）
   * @param params   事件附加参数（键值对）
   * @returns 无返回值
   */
  poke(eventKey, params) {
  }
};

// src/main/base/app_window.ts
var import_electron4 = require("electron");
var AppWindow = class _AppWindow {
  constructor() {
    this.winName = null;
    ///窗口显示（show）完成后的回调，由子类按需赋值
    this.didShowCallBack = null;
    ///窗口属性：当前窗口对应的 Electron BrowserWindow 实例
    this.win = null;
  }
  static {
    /**
     * 窗口单例注册表（静态）：key 为窗口标识 tag（字符串），value 为对应的 AppWindow 实例。
     * 用于跨窗口判断「某类窗口是否已打开」，实现单例管理。
     */
    this.winMap = {};
  }
  /**
   * 注册窗口实例到单例表。
   * @param tag 窗口标识，作为 winMap 的 key
   * @param window 已创建的窗口实例
   */
  static addWinMap(tag, window) {
    this.winMap[tag] = window;
  }
  /**
   * 判断指定 tag 的窗口是否已经打开（存在于单例表中）。
   * @param tag 窗口标识
   * @returns 已打开返回 true，否则返回 false
   */
  static isOpened(tag) {
    if (this.winMap[tag]) {
      return true;
    } else {
      return false;
    }
  }
  ///设置窗口名（用于统计埋点、日志）
  setWinName(winName) {
    this.winName = winName;
  }
  ///获取窗口名
  getWinName() {
    return this.winName;
  }
  /**
   * 将窗口显示到屏幕（唤醒显示）。
   * why：先 setOpacity(0) 再 show，是为了规避 Electron 在窗口透明(transparent=true)
   * 场景下的 bug——直接 show 会闪一下白屏，因此先以 0 透明度显示，再延迟恢复目标透明度。
   * 延迟时长 1000/50 = 20ms（约一帧）。
   */
  showOnScreen() {
    logger_default.log("showOnScreen");
    this.win?.setOpacity(0);
    this.win?.show();
    setTimeout(() => {
      this.win?.setOpacity(local_store_default.alpha);
    }, 1e3 / 50);
    if (this.didShowCallBack) {
      this.didShowCallBack();
    }
  }
  /**
   * 将窗口从屏幕隐藏（贴边隐藏用）。
   */
  hideFromScreen() {
    logger_default.log("hideFromScreen");
    this.win?.hide();
  }
  /**
   * 判断窗口当前是否可见。
   * @returns 可见返回 true，否则 false（窗口尚未创建时返回 undefined）
   */
  isShow() {
    return this.win?.isVisible();
  }
  /**
   * 设置窗口位置（带分辨率缩放适配）。
   * why：在不同显示器缩放比例(scaleFactor)下直接 setPosition 会导致窗口实际尺寸发生
   * 偏移/变化，因此这里针对非整数缩放系数做额外的 bounds 校正。
   * @param x 目标逻辑横坐标
   * @param y 目标逻辑纵坐标
   */
  setPosition(x, y) {
    let bounds = this.win?.getBounds();
    let sf = import_electron4.screen.getDisplayMatching(bounds).scaleFactor;
    if (sf !== 1 && sf !== 2 && sf !== 3) {
      bounds.x = x;
      bounds.y = y;
      this.win?.setBounds(bounds);
      let newBounds = this.win?.getBounds();
      let diffW = newBounds.width - bounds.width;
      let diffH = newBounds.height - bounds.height;
      if (diffW <= 2 && diffH <= 2 && diffW >= 0 && diffH >= 0) {
        bounds.width -= diffW;
        bounds.height -= diffH;
        this.win?.setBounds(bounds, true);
      }
    } else {
      this.win?.setPosition(Math.floor(x), Math.floor(y), true);
    }
  }
  /**
  * 显示窗口：确保窗口已创建后 show，并上报「窗口展示」埋点统计。
  * @param parent 父窗口（可为 null）
  */
  show(parent = null) {
    this.createWindow(parent);
    statistic_default.poke("WindowShow", { name: this.winName });
  }
  /**
   * 创建窗口：核心生命周期入口。
   * why：若 this.win 已存在则直接返回，保证「单例」——不会重复创建同一窗口。
   * 创建完成后立即绑定 ready-to-show / move / blur / resize / close 等事件，
   * 并转发到对应子类钩子（onWindowCreated / onWindowBoundsChanged / onWindowBlur / onWindowClosed）。
   * @param parent 父窗口
   */
  createWindow(parent) {
    if (this.win) {
      return;
    }
    var options = {
      useContentSize: true,
      // width/height 按内容区尺寸计算
      show: false,
      // 先不显示，等 ready-to-show 后再显示
      resizable: false,
      // 默认不可缩放
      parent,
      // 父窗口
      movable: true,
      // 可移动
      minimizable: false,
      // 不可最小化
      maximizable: false,
      // 不可最大化
      webPreferences: {
        preload: (0, import_path2.join)(__dirname, "../preload/index.cjs"),
        // 预加载脚本，注入渲染层桥接
        nodeIntegration: true,
        // 允许渲染层直接使用 Node
        contextIsolation: false,
        // 关闭上下文隔离，便于渲染层直接访问主进程暴露的对象
        devTools: true
        // 允许打开开发者工具
      }
    };
    import_electron3.Menu.setApplicationMenu(null);
    this.configWindow(options);
    this.win = new import_electron3.BrowserWindow(options);
    this.onWindowCreated(this.win);
    this.win?.once("ready-to-show", () => {
      this.win?.show();
      this.onWindowShown();
    });
    this.win?.on("move", () => {
      this.onWindowBoundsChanged(this.win?.getBounds());
    });
    this.win?.on("blur", () => {
      this.onWindowBlur();
    });
    this.win?.on("resize", () => {
      this.onWindowBoundsChanged(this.win?.getBounds());
    });
    this.win?.on("close", (event) => {
      let index = Object.values(_AppWindow.winMap).findIndex((v) => v == this);
      if (index >= 0) {
        _AppWindow.winMap[Object.keys(_AppWindow.winMap)[index]] = null;
      }
      this.onWindowClosed(this.win);
      this.win = null;
    });
  }
  /**
   * 处理窗口位置/尺寸变化（子类可重写，例如持久化窗口 bounds）。
   * @param bounds 变化后的窗口边界
   */
  onWindowBoundsChanged(bounds) {
  }
  /**
   * 配置窗口参数（子类重写以设定具体窗口的尺寸/标题/无边框/置顶等）。
   * @param options 待修改的窗口构造参数
   */
  configWindow(options) {
  }
  /**
   * 窗口显示时回调（默认在开发环境自动打开开发者工具）。
   */
  onWindowShown() {
    if (!import_electron3.app.isPackaged) {
      this.win?.webContents.openDevTools({ mode: "detach" });
    }
  }
  /**
   * 窗口关闭时回调（默认上报「窗口关闭」埋点统计）。
   * @param win 被关闭的 BrowserWindow
   */
  onWindowClosed(win) {
    statistic_default.poke("WindowClose", { name: this.winName });
  }
  ///窗口失去焦点回调（子类可重写，例如贴边隐藏逻辑）
  onWindowBlur() {
  }
};

// src/main/pages/AddStockWindow.ts
var AddStockWindow = class extends AppWindow {
  /**
   * 配置窗口外观：宽 680、高 371 的无边框弹窗（尺寸为魔法数字，用于适配弹窗内容布局）。
   * @param options 待修改的窗口构造参数
   */
  configWindow(options) {
    options.width = 680;
    options.height = 371;
    options.frame = false;
  }
  /**
   * 窗口创建成功回调：加载 "/addstock" 路由渲染添加股票页面。
   * @param win 创建完成的 BrowserWindow
   */
  onWindowCreated(win) {
    win.loadWithRoute("/addstock");
  }
};

// src/main/pages/IndexWindow.ts
var import_electron6 = require("electron");

// src/main/service/index.ts
var service_default = {
  /**
   * 添加股票
   * @param ipcEvent 
   * @param data
   * 
   * 1:添加成功
   * 2:需要买会员 
   */
  // 添加自选股：离线版无登录态，此处只按 "VIP 或自选股不足 1 只" 判断是否放行。
  // 返回码见上方 JSDoc——1 添加成功、2 需要买会员、3 添加失败（如重复添加）。
  async addStock(ipcEvent, data) {
    let sugs = await this.listUserSug();
    if (local_store_default.isVip || sugs.length < 1) {
      if (local_store_default.editWith((config) => config.addStock(data))) {
        return 1;
      } else {
        return 3;
      }
    } else {
      return 2;
    }
  },
  /**
   * 移除
   * @param ipcEvent 
   * @param data 
   * @returns 
   */
  // 移除自选股：按 key 从本地配置中删除，恒返回 true（删除结果由 removeStock 内部处理）
  async removeStock(ipcEvent, data) {
    local_store_default.removeStock(data);
    return true;
  },
  // 置顶自选股：把指定股票排到自选列表最前，无返回值
  async setTopStock(ipcEvent, data) {
    local_store_default.setTopStock(data);
  },
  /**
   * 自选股拖拽排序：把 from 移动到 to 之前（after=true 时移动到之后）。
   * 调用方是渲染层的 drag-sort.js，经 ipc.invoke('api', 'sortKeys', ...) 进入。
   */
  async sortKeys(data) {
    const from = data && data.from;
    const to = data && data.to;
    const after = !!(data && data.after);
    if (!from || !to || from === to) return false;
    local_store_default.editWith((config) => {
      const keys = config.keys;
      const fromIndex = keys.findIndex((k) => k.key === from);
      const toIndex = keys.findIndex((k) => k.key === to);
      if (fromIndex < 0 || toIndex < 0) return false;
      const [item] = keys.splice(fromIndex, 1);
      const insertAt = keys.findIndex((k) => k.key === to);
      keys.splice(after ? insertAt + 1 : insertAt, 0, item);
    });
    return true;
  },
  /**
   * 获取用户添加的所有Sug
   */
  // 获取用户全部自选股：直接返回 local_store 中持久化的 keys 数组（Sug 数组）
  async listUserSug() {
    return local_store_default.config.keys;
  },
  // 查询单只股票的最新行情：直接转发给行情服务 StockUpdateService
  getStock(key) {
    return stock_default.getStockData(key);
  },
  // 订阅行情事件：把渲染层传入的回调注册到行情服务，行情更新时触发
  onEvent(eventKey, listener) {
    stock_default.onEvent(eventKey, listener);
  },
  // 取消订阅行情事件（须传入与订阅时相同的回调引用才能移除）
  removeEvent(eventKey, listener) {
    stock_default.removeEvent(eventKey, listener);
  },
  // 强制立即刷新所有行情：转发给行情服务的 forceUpdate（直连腾讯/新浪接口主动拉取）
  forStockUpdate() {
    stock_default.forceUpdate();
  }
};

// src/main/api/StockApi.ts
var import_axios = __toESM(require("axios"));
var import_iconv_lite = __toESM(require("iconv-lite"));
var import_https = __toESM(require("https"));
var HttpsProxyAgent = require("https-proxy-agent");
import_axios.default.defaults.timeout = 3e3;
import_axios.default.defaults.httpsAgent = new import_https.default.Agent({
  rejectUnauthorized: false
});
var marketMap = /* @__PURE__ */ new Map();
marketMap.set("sh", "A\u80A1");
marketMap.set("jj", "\u57FA\u91D1");
marketMap.set("sz", "A\u80A1");
marketMap.set("hk", "\u6E2F\u80A1");
marketMap.set("us", "\u7F8E\u80A1");
marketMap.set("qh", "\u671F\u8D27");
marketMap.set("gzqh", "\u80A1\u6307\u671F\u8D27");
marketMap.set("nq", "\u4E09\u677F");
marketMap.set("zz", "\u8F6C\u503A");
marketMap.set("wh", "\u5916\u6C47");
marketMap.set("bj", "A\u80A1");
var Sug = class {
  constructor(code, marketCode) {
    this.code = code;
    this.marketCode = marketCode;
    this.key = this.marketCode + this.code;
  }
};
var Stock = class {
};
function parseSinaLine(line, sug) {
  var stock = new Stock();
  let tks = line.split('="');
  let key = tks[0].split("hq_str_")[1];
  let tmp = tks[1];
  let txt = tmp.substring(0, tmp.length - 2);
  let datas = txt.split(",");
  stock.key = key;
  stock.code = sug.code;
  stock.name = datas[0];
  if (sug.marketCode == "zz") {
    stock.price = parseFloat(datas[3]);
    stock.open = parseFloat(datas[1]);
    stock.preClose = parseFloat(datas[2]);
    stock.per = (stock.price - stock.preClose) / stock.preClose;
    stock.volume = parseFloat(datas[8]);
    stock.amount = parseFloat(datas[9]);
    stock.timeStr = datas[30];
  } else if (sug.marketCode == "qh") {
    stock.price = parseFloat(datas[8]);
    stock.open = parseFloat(datas[2]);
    stock.preClose = parseFloat(datas[10]);
    stock.per = (stock.price - stock.preClose) / stock.preClose;
    stock.volume = parseFloat(datas[14]);
    stock.timeStr = datas[17];
  } else if (sug.marketCode == "gzqh") {
    stock.name = datas[datas.length - 1];
    stock.price = parseFloat(datas[3]);
    stock.open = parseFloat(datas[0]);
    stock.preClose = parseFloat(datas[14]);
    stock.per = (stock.price - stock.preClose) / stock.preClose;
    stock.volume = parseFloat(datas[4]);
    stock.timeStr = datas[36];
  } else if (sug.marketCode == "wh") {
    stock.name = datas[9];
    stock.price = parseFloat(datas[1]);
    stock.open = parseFloat(datas[5]);
    stock.preClose = parseFloat(datas[3]);
    stock.per = (stock.price - stock.preClose) / stock.preClose;
    stock.dayMax = parseFloat(datas[6]);
    stock.dayMin = parseFloat(datas[7]);
    stock.timeStr = datas[17];
  }
  return stock;
}
function parseLine(line, sug) {
  var stock = new Stock();
  var tks = line.split('="');
  if (sug.marketCode == "hk") {
    stock.key = sug.key;
  } else {
    stock.key = tks[0].substring(2);
  }
  stock.code = stock.key;
  let datas = tks[1].split("~");
  if (stock.key?.startsWith("jj")) {
    stock.name = datas[1];
    stock.price = parseFloat(datas[2]);
    stock.preClose = parseFloat(datas[5]);
    stock.per = (stock.price - stock.preClose) / stock.preClose;
  } else {
    stock.name = datas[1];
    stock.price = parseFloat(datas[3]);
    stock.preClose = parseFloat(datas[4]);
    stock.open = parseFloat(datas[5]);
    stock.buy1Vo = parseFloat(datas[10]);
    stock.sell1Vo = parseFloat(datas[20]);
    stock.per = parseFloat(datas[32]) / 100;
    stock.dayMax = parseFloat(datas[33]);
    stock.dayMin = parseFloat(datas[34]);
    stock.volume = parseFloat(datas[6]) * 100;
    stock.amount = parseFloat(datas[57]) * 1e4;
    stock.swap = parseFloat(datas[38]) / 100;
    if (datas.length > 74) {
      stock.abr = parseFloat(datas[74]) / 100;
    }
  }
  stock.timeStr = datas[30];
  return stock;
}
function parseFenShi(key, data) {
  let fenshi = {};
  let points = [];
  let jo = JSON.parse(data.split("=")[1]);
  let tmp = jo.data[key].data;
  let datas = tmp.data;
  let date2 = tmp.date;
  for (let i in datas) {
    let one = datas[i];
    let tks = one.split(" ");
    let point = {};
    point.time = date2 + "T" + tks[0] + "00";
    point.price = parseFloat(tks[1]);
    points.push(point);
  }
  fenshi.points = points;
  return fenshi;
}
function parseK(d) {
  let date2 = d[0];
  let open = d[1];
  let close = d[2];
  let max = d[3];
  let min = d[4];
  let vol = d[5];
  let the = {};
  the.max = parseFloat(max);
  the.min = parseFloat(min);
  the.date = date2;
  the.open = parseFloat(open);
  the.close = parseFloat(close);
  the.vol = parseFloat(vol);
  return the;
}
function parseDayk(key, data) {
  let dayk = {};
  let points = [];
  let jo = JSON.parse(data.split("=")[1]);
  if (jo.code != 0) {
    return null;
  }
  let tmp = jo.data[key];
  let day = tmp.qfqday;
  if (day == void 0) {
    day = tmp.day;
  }
  for (let i in day) {
    let d = day[i];
    let o = parseK(d);
    o.date = o.date.substring(5);
    points.push(o);
  }
  dayk.points = points;
  return dayk;
}
function parseMk(key, data, type) {
  let mk = {};
  let points = [];
  let jo = JSON.parse(data.split("=")[1]);
  if (jo.code != 0) {
    return null;
  }
  let tmp = jo.data[key];
  let ms = tmp[type];
  for (let i in ms) {
    let d = ms[i];
    let o = parseK(d);
    let tmp2 = o.date.substring(4);
    o.date = tmp2.substring(0, 4) + "-" + tmp2.substring(4, 6) + ":" + tmp2.substring(6, 8);
    points.push(o);
  }
  mk.points = points;
  return mk;
}
var StockApi_default = {
  /**
   * 批量拉取腾讯实时行情（核心接口）。
   *
   * 流程：
   *   1. 过滤掉「新浪专属」品种（extra 以 "sina_" 开头且不是 sina_bj，它们走 getSinaStocks）
   *   2. 按市场拼接 URL：美股取 code 的 `.` 前段并大写（usAAPL）、港股加 "r_" 前缀、
   *      其余直接 marketCode+code，逗号连接多只股票
   *   3. `_=` 时间戳防止接口缓存
   *   4. 数组缓冲接收 + iconv GBK 解码，按 `;` 拆行逐行 parseLine
   *   5. 返回以 key 为索引的 stockData 映射（key 用 sug.key 覆盖，保证与本地 self 选股一致）
   *
   * proxy 参数历史上用于是否走代理，但当前实现未使用，恒传 false。
   */
  async getStocks(sugs, proxy) {
    let oldSugs = sugs;
    sugs = [];
    var url = "https://web.sqt.gtimg.cn/q=";
    for (let i in oldSugs) {
      let s = oldSugs[i];
      if (s.extra?.startsWith("sina_") && s.extra !== "sina_bj") {
        continue;
      }
      sugs.push(s);
      if (s.marketCode == "us") {
        url = url + s.marketCode + s.code?.split(".")[0].toUpperCase() + ",";
      } else if (s.marketCode == "hk") {
        url = url + "r_" + s.marketCode + s.code + ",";
      } else {
        url = url + s.marketCode + s.code + ",";
      }
    }
    url += "&_=" + (/* @__PURE__ */ new Date()).getTime();
    try {
      let res = await import_axios.default.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
          "Referer": "https://gu.qq.com/"
        },
        responseType: "arraybuffer",
        responseEncoding: "binary"
      });
      let t = import_iconv_lite.default.decode(res.data, "gbk");
      let stockData = {};
      var lines = t.split(";");
      let index = 0;
      for (let i in lines) {
        let line = lines[i].trim();
        let sug = sugs.find((j) => {
          let currCode = lines[i].split("=")[0].replaceAll("v_", "").trim();
          let searchKey = "";
          if (j.marketCode == "us") {
            searchKey = j.marketCode + j.code?.split(".")[0].toUpperCase();
          } else if (j.marketCode == "hk") {
            searchKey = "r_" + j.marketCode + j.code;
          } else {
            searchKey = "" + j.marketCode + j.code;
          }
          return searchKey === currCode;
        }) || new Sug("", "");
        if (line.length > 0) {
          let s = parseLine(line, sug);
          s.index = index;
          index++;
          if (s.code && sug?.key) {
            s.key = sug.key;
            s.marketCode = sug.marketCode;
            s.extra = sug.extra;
            stockData[s.key] = s;
          } else {
            logger_default.log("get stock error:");
            logger_default.log("sug:" + JSON.stringify(sug));
            logger_default.log("stock:" + JSON.stringify(s));
          }
        }
      }
      return stockData;
    } catch (err) {
      logger_default.log(err + "");
      return null;
    }
  },
  /**
   * 腾讯「搜索联想」接口：输入关键字返回匹配的股票/基金候选（添加股票用）。
   * 返回的 name 是 unicode 转义（\uXXXX），需要解码成真实中文。
   */
  async getSugs(key) {
    var p = { "v": 2, "q": key, "t": "all" };
    let res = await import_axios.default.get("https://smartbox.gtimg.cn/s3/", {
      params: p,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
        "Referer": "https://gu.qq.com/"
      }
    });
    var sugs;
    sugs = [];
    var t = res.data;
    t = t.substring(8, t.length - 1);
    var lines = t.split("^");
    if (lines.length < 1) {
      return sugs;
    }
    for (let i in lines) {
      var l = lines[i];
      var sug = new Sug("code", "xx");
      var tks = l.split("~");
      if (tks.length < 2) {
        continue;
      }
      let mkt = tks[0];
      sug.marketCode = mkt;
      sug.market = marketMap.get(mkt);
      sug.code = tks[1];
      sug.key = sug.marketCode + sug.code;
      let n = tks[2].match(/\\u([0-9A-Fa-f]{4})/g);
      let name = tks[2];
      for (let j in n) {
        let w = n[j];
        let hex = parseInt(w.substr(2), 16);
        let tmp = String.fromCharCode(hex);
        name = name.replace(w, tmp);
      }
      sug.name = name;
      sug.extra = tks[4];
      sugs.push(sug);
    }
    return sugs;
  },
  /**
   * 新浪「搜索联想」接口：补充腾讯不覆盖的品种（期货/股指期货/外汇/转债/三板）。
   * 返回也是分号分隔文本，但每行用逗号分隔，且字段位置与腾讯完全不同，
   * 需要按 tks[1]（新浪内部类型码）映射回我们的 marketCode。
   */
  async getSinaSugs(key) {
    let now = (/* @__PURE__ */ new Date()).getTime();
    var p = { "type": "81,85,86,88,71,11", "key": key, "name": "suggestdata_" + now };
    let res = await import_axios.default.get("https://suggest3.sinajs.cn/suggest/", {
      params: p,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
        "Referer": "https://finance.sina.com.cn/"
      },
      responseType: "arraybuffer",
      responseEncoding: "binary"
    });
    let data = import_iconv_lite.default.decode(res.data, "gb18030");
    var sugs;
    sugs = [];
    let tmp = data.split('="')[1];
    let txt = tmp.substring(0, tmp.length - 2);
    let lines = txt.split(";");
    for (let i in lines) {
      let line = lines[i];
      let tks = line.split(",");
      let marketCode = null;
      let key2 = null;
      if (tks[1] == "81" && tks[4].endsWith("\u8F6C\u503A")) {
        marketCode = "zz";
        key2 = tks[3];
      } else if (tks[1] == "87" || tks[1] == "85") {
        marketCode = "qh";
        key2 = "nf_" + tks[2].toUpperCase();
      } else if (tks[1] == "88") {
        marketCode = "gzqh";
        key2 = "nf_" + tks[2].toUpperCase();
      } else if (tks[1] == "71") {
        marketCode = "wh";
        key2 = "fx_s" + tks[2];
      } else if (tks[1] == "11" && tks[3].startsWith("bj")) {
        marketCode = "bj";
        key2 = "bj" + tks[2].toUpperCase();
      } else {
        console.log("not support market type.");
        console.log(tks);
      }
      if (marketCode != null) {
        var sug = new Sug(tks[2], marketCode);
        sug.market = marketMap.get(marketCode);
        sug.name = tks[4];
        sug.extra = "sina_" + marketCode;
        sug.key = key2;
        sugs.push(sug);
      }
    }
    return sugs;
  },
  /**
   * 批量拉取新浪行情（期货/股指期货/外汇/转债等新浪专属品种）。
   * hq.sinajs.cn 需要在 Referer 带 finance.sina.com.cn 才返回数据，
   * 并且 URL 用原名（hq_str_nf_XXX 等）拼接；返回每行是 "var hq_str_XXX=..."。
   */
  async getSinaStocks(sugs) {
    let now = (/* @__PURE__ */ new Date()).getTime();
    var url = "https://hq.sinajs.cn/etag.php?_=" + now + "&list=";
    let sinaSugs = [];
    for (let i in sugs) {
      let s = sugs[i];
      if (s.extra == "sina_zz") {
        url += s.key + ",";
        sinaSugs.push(s);
      } else if (s.extra == "sina_qh") {
        url += s.key + ",";
        sinaSugs.push(s);
      } else if (s.extra == "sina_gzqh") {
        url += s.key + ",";
        sinaSugs.push(s);
      } else if (s.extra == "sina_wh") {
        url += s.key + ",";
        sinaSugs.push(s);
      }
    }
    if (sinaSugs.length == 0) {
      return null;
    }
    try {
      let res = await import_axios.default.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
          "Referer": "https://finance.sina.com.cn/"
        },
        responseType: "arraybuffer",
        responseEncoding: "binary"
      });
      let data = import_iconv_lite.default.decode(res.data, "gb18030");
      logger_default.log("\u65B0\u6D6A:----------------" + JSON.stringify(data));
      let stockData = {};
      let lines = data.trim().split(";");
      let index = 0;
      for (let i in lines) {
        let line = lines[i];
        if (line.trim() == "") {
          continue;
        }
        let sug = sinaSugs[index];
        let s = parseSinaLine(line, sug);
        s.index = index;
        index++;
        if (s.code && sug?.key?.toLowerCase().indexOf(s.code.toLowerCase()) != -1) {
          if (sug?.key) {
            s.key = sug.key;
            s.marketCode = sug.marketCode;
            stockData[s.key] = s;
          }
        }
      }
      return stockData;
    } catch (err) {
      logger_default.log(err + "");
      return null;
    }
  },
  /**
   * 拉取某支股票的分时数据，并补充显示名称（优先别名 alias，其次配置里的 name）。
   */
  async getFenShiData(key) {
    let url = "https://web.ifzq.gtimg.cn/appstock/app/minute/query?_var=min_data_" + key + "&code=" + key + "&r=" + Math.random();
    console.log(url);
    let res = await import_axios.default.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
        "Referer": "https://gu.qq.com/"
      }
    });
    let fenshi = parseFenShi(key, res.data);
    let conf = local_store_default.config;
    fenshi.name = conf.alias[key];
    if (fenshi.name == void 0 || fenshi.name == null || fenshi.name == "") {
      for (let i in conf.keys) {
        let s = conf.keys[i];
        if (s.key == key) {
          fenshi.name = s.name;
          break;
        }
      }
    }
    return fenshi;
  },
  /**
   * 拉取某支股票的日K（前复权，最多 180 根）。
   */
  async getDaykData(key) {
    let url = "https://proxy.finance.qq.com/ifzqgtimg/appstock/app/newfqkline/get?_var=kline_dayqfq&param=" + key + ",day,,,180,qfq&r=" + Math.random();
    console.log(url);
    let res = await import_axios.default.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
        "Referer": "https://gu.qq.com/"
      }
    });
    return parseDayk(key, res.data);
  },
  /**
   * 拉取某支股票的分钟K（type 如 m5/m15/m30/m60），最多 180 根。
   */
  async getMkData(key, type) {
    let url = "https://ifzq.gtimg.cn/appstock/app/kline/mkline?param=" + key + "," + type + ",,180&_var=" + type + "_today&r=" + Math.random();
    console.log(url);
    let res = await import_axios.default.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
        "Referer": "https://gu.qq.com/"
      }
    });
    return parseMk(key, res.data, type);
  },
  /**
   * 应用 HTTP(S) 代理：不带用户名密码时用裸 host:port，否则用 user:pass@host:port。
   * 代理是否启用由 SetUpProxy（index.ts）根据配置 proxySwitch 决定。
   */
  setProxy(host, port, un, pass) {
    if (un == null || un == void 0) {
      let agent = new HttpsProxyAgent("http://" + host + ":" + port);
      agent.rejectUnauthorized = false;
      import_axios.default.defaults.httpsAgent = agent;
    } else {
      let agent = new HttpsProxyAgent("http://" + un + ":" + pass + "@" + host + ":" + port);
      agent.rejectUnauthorized = false;
      import_axios.default.defaults.httpsAgent = agent;
    }
  },
  /**
   * 清空代理，恢复默认直连（仍是关闭证书校验的 https.Agent）。
   */
  cleanProxy() {
    import_axios.default.defaults.httpsAgent = new import_https.default.Agent({
      rejectUnauthorized: false
    });
    import_axios.default.defaults.proxy = false;
  }
};

// src/main/service/stock.ts
var import_electron5 = require("electron");
var import_events2 = __toESM(require("events"));
var eventEmmiter2 = new import_events2.default();
var _indexWindowVisible = true;
var ipcSender;
var scheduleInstance;
function _cancelSchedule() {
  if (scheduleInstance) {
    clearTimeout(scheduleInstance);
  }
}
function _scheduleNext(now = false) {
  logger_default.logDebug("_scheduleNext:" + now);
  _cancelSchedule();
  if (now) {
    _updateStockInfo(true);
    return;
  }
  let fetchTime = local_store_default.isVip ? 3200 : 6e4;
  if (!_indexWindowVisible && local_store_default.isVip) {
    if (local_store_default.config.freqWhenHide == null) {
      fetchTime = 15e3;
    } else {
      fetchTime = local_store_default.config.freqWhenHide * 1e3;
    }
  }
  logger_default.logDebug("fetchTime:" + fetchTime);
  scheduleInstance = setTimeout(_updateStockInfo, fetchTime);
}
var prevResponse = null;
var globalSugMap = {};
function checkPriceAlert(prev, current) {
  let tmp = {};
  if (prev != null) {
    for (let i in prev) {
      let v = prev[i];
      if (v.stock) {
        tmp[v.stock.key] = v;
      } else {
        logger_default.log("no stock found in v:");
        logger_default.log(v);
      }
    }
    prev = tmp;
  }
  let alertInfos = local_store_default.config.alertInfos;
  for (let i in current) {
    let cuStock = current[i].stock;
    if (!cuStock) {
      logger_default.log("cuStock not valid.");
      continue;
    }
    let key = cuStock.key;
    let v = alertInfos[key];
    if (!v) {
      continue;
    }
    if (v.downalert_switch) {
      let price = v.downalert_price;
      let text = v.downalert_text;
      let showAlert = false;
      if (prev == null && price && text && cuStock.price && cuStock.price < price) {
        showAlert = true;
      } else if (prev != null && prev[key] && price && text && cuStock.price) {
        let preStock = prev[key].stock;
        if (preStock && preStock.price && preStock.price >= price && cuStock.price < price) {
          showAlert = true;
        }
      }
      if (showAlert) {
        eventEmmiter2.emit("alertPrice", { text, key: cuStock.key, at: "downalert_switch" });
      }
    }
    if (v.upalert_switch) {
      let price = v.upalert_price;
      let text = v.upalert_text;
      let showAlert = false;
      if (prev == null && price && text && cuStock.price && cuStock.price > price) {
        showAlert = true;
      } else if (prev != null && prev[key] && price && text && cuStock.price) {
        let preStock = prev[key].stock;
        if (preStock && preStock.price && preStock.price <= price && cuStock.price > price) {
          showAlert = true;
        }
      }
      if (showAlert) {
        eventEmmiter2.emit("alertPrice", { text, key: cuStock.key, at: "upalert_switch" });
      }
    }
  }
}
function processData(stockData) {
  let now = /* @__PURE__ */ new Date();
  let nowStr = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
  for (let i in stockData) {
    let stock = stockData[i].stock;
    if (!stock) {
      logger_default.log("processData stock not valid:");
      logger_default.log(stockData[i]);
      continue;
    }
    let conf = local_store_default.config;
    let cost = conf.cost[stock.key];
    if (cost && cost.amount > 0) {
      if (nowStr == cost.date && cost.price) {
        stock.cost = cost.price;
        stock.dayProfite = (stock.price - cost.price) * cost.amount;
      } else {
        stock.dayProfite = stock.preClose * cost.amount * stock.per;
      }
    } else {
      stock.dayProfite = 0;
    }
    if (cost && cost.amount > 0 && cost.price > 0) {
      let profite = (stock.price - cost.price) * cost.amount;
      let per = profite / (cost.price * cost.amount);
      stock.totalPro = profite;
      stock.totalProPer = per;
      stock.cost = cost.price;
    } else {
      stock.totalPro = 0;
      stock.totalProPer = 0;
    }
  }
}
async function _updateStockInfo(force = false) {
  logger_default.logDebug("_updateStockInfo:" + force);
  let stockData = [];
  try {
    let sugList = await service_default.listUserSug();
    if (sugList.length == 0) {
      ipcSender?.send("stock-update", { data: [] });
      logger_default.log("sugList.length==0");
      return;
    }
    if (force) {
      let stockData2 = [];
      sugList.forEach((sug) => {
        if (sug && sug.key) {
          stockData2.push({ sug, stock: globalSugMap[sug.key] });
        }
      });
      ipcSender?.send("stock-update", {
        data: stockData2
      });
    }
    logger_default.logDebug("getStocks:" + force);
    let retStock = await StockApi_default.getStocks(sugList, false);
    logger_default.logDebug("getSinaStocks:" + force);
    let sinaStock = await StockApi_default.getSinaStocks(sugList);
    logger_default.logDebug("getSinaStocks done." + force);
    if (retStock != null) {
      globalSugMap = Object.assign(globalSugMap, retStock);
    } else {
      logger_default.log("update tencent stock data fail.");
    }
    if (sinaStock != null) {
      globalSugMap = Object.assign(globalSugMap, sinaStock);
    }
    sugList.forEach((sug) => {
      if (sug && sug.key) {
        stockData.push({ sug, stock: globalSugMap[sug.key] });
      }
    });
    if (stockData.length > 0) {
      let prevData = null;
      if (prevResponse != null) {
        prevData = prevResponse.data;
      }
      checkPriceAlert(prevData, stockData);
      processData(stockData);
      prevResponse = {
        data: stockData
      };
    } else {
      logger_default.log("stockData is empty.");
    }
    ipcSender?.send("stock-update", prevResponse);
    logger_default.logDebug("will _scheduleNext:" + ipcSender);
    if (ipcSender) {
      _scheduleNext(false);
    }
  } catch (e) {
    logger_default.log("stock-update-err:");
    let exceptionStr = "uncaughtException:" + e + "|||" + e.stack;
    logger_default.log(exceptionStr);
  }
}
import_electron5.ipcMain.on("fetch-stock", () => {
  if (prevResponse != null) {
    ipcSender?.send("stock-update", prevResponse);
  }
});
var configLister = (config, diffKeys) => {
  if (diffKeys.indexOf("keys") >= 0 || diffKeys.indexOf("token") >= 0) {
    _scheduleNext(true);
  }
};
var stock_default = {
  /**
   *  附加到窗口
   */
  attachWebContents(contents) {
    ipcSender = contents;
    local_store_default.removeListener("onConfig", configLister);
    local_store_default.on("onConfig", configLister);
    _scheduleNext(true);
    logger_default.logDebug("attachWebContents:" + ipcSender);
  },
  /**
   * 移除 WebContents
   * @param contents 
   */
  detachWebContents(contents) {
    if (ipcSender === contents) {
      local_store_default.removeListener("onConfig", configLister);
      ipcSender = null;
      _cancelSchedule();
    }
    logger_default.logDebug("detachWebContents:" + ipcSender);
  },
  /**
   * 查询股票数据
   * @param key 
   */
  getStockData(key) {
    return globalSugMap[key];
  },
  onEvent(eventKey, listener) {
    eventEmmiter2.on(eventKey, listener);
  },
  removeEvent(eventKey, listener) {
    eventEmmiter2.removeListener(eventKey, listener);
  },
  forceUpdate() {
    _scheduleNext(true);
  },
  /**
   * 这个api主要是为了实现当主面板不可见时，降低请求频率的功能的。
   * @param isvisible indexdow是否可见
   */
  setIndexWindowVisible(isvisible) {
    _indexWindowVisible = isvisible;
  }
};

// src/main/pages/IndexWindow.ts
var HIDE_TYPE_NOHIDE = 0;
var HIDE_TYPE_RIGHT = 1;
var HIDE_TYPE_LEFT = 2;
var HIDE_TYPE_RIGHT_SHOW = 3;
var HIDE_TYPE_LEFT_SHOW = 4;
var IndexWindow = class extends AppWindow {
  constructor() {
    super(...arguments);
    ///是否开启贴边隐藏开关（true 表示允许贴边隐藏）
    this.hideSwitch = true;
    ///当前贴边隐藏状态，取值见上方 HIDE_TYPE_* 常量
    this.hideType = HIDE_TYPE_NOHIDE;
    ///配置变更监听器（保存引用以便关闭时移除监听）
    this.configListener = null;
  }
  /**
   * 配置主面板窗口外观。
   * why：
   *   - 无边框(frame=false) + 透明/无阴影 + 不显示任务栏(skipTaskbar=true) = 悬浮看盘面板；
   *   - alwaysOnTop=true 使面板始终置顶于其他窗口之上，便于盯盘。
   * @param options 待修改的窗口构造参数
   */
  configWindow(options) {
    options.alwaysOnTop = true;
    options.center = false;
    options.frame = false;
    options.skipTaskbar = true;
    options.backgroundColor = "#00000000";
    options.thickFrame = false;
    options.hasShadow = false;
    if (local_store_default.config.windowTransparent) {
      options.transparent = true;
      options.resizable = false;
    } else {
      options.transparent = false;
      options.resizable = false;
    }
    let bounds = local_store_default.config.bounds;
    if (bounds == null) {
      let sb = import_electron6.screen.getPrimaryDisplay().bounds;
      let y = sb.y + sb.height - 150;
      let x = sb.x + sb.width - 250;
      bounds = { x, y, width: 250, height: 150 };
    }
    if (bounds) {
      options.x = bounds.x;
      options.y = bounds.y;
      options.width = bounds.width;
      options.height = bounds.height;
    }
  }
  /**
   * 窗口创建成功回调。
   * why：
   *   - attachWebContents 将渲染进程绑定到股票服务，使其能接收行情推送/图表数据；
   *   - 监听 appConfig 的 onConfig 事件，把配置变更转发到渲染层；
   *   - 创建时把 cfg.bounds 置 null，让下次启动重新计算默认位置（避免脏数据）；
   *   - win32 平台强制设置置顶层级为 normal；
   *   - 设置窗口不透明度为配置的 alpha 值，再加载 "/" 路由渲染主面板。
   */
  onWindowCreated(win) {
    stock_default.attachWebContents(win.webContents);
    var that = this;
    this.configListener = (config, diffKeys) => {
      that.handleConfigChanged(config, diffKeys);
    };
    local_store_default.on("onConfig", this.configListener);
    local_store_default.editWith((cfg) => {
      cfg.bounds = null;
    });
    if (process.platform == "win32") {
      win.setAlwaysOnTop(true, "normal");
    }
    win.setOpacity(local_store_default.alpha);
    win.loadWithRoute("/");
  }
  /**
   * 窗口关闭回调：解绑渲染进程与股票服务，并移除配置变更监听，避免内存泄漏。
   */
  onWindowClosed(win) {
    stock_default.detachWebContents(win.webContents);
    if (this.configListener) {
      local_store_default.removeListener("onConfig", this.configListener);
    }
  }
  /**
   * 窗口位置/尺寸变化回调（当前暂不持久化 bounds，保留扩展位）。
   */
  onWindowBoundsChanged(bounds) {
    if (bounds) {
    }
  }
  /**
   * 窗口失去焦点回调（贴边隐藏逻辑当前被注释，保留扩展位）。
   */
  onWindowBlur() {
  }
  /**
   * 配置变更处理：更新窗口不透明度，并把新配置及变更的 key 数组转发给渲染层。
   * 若 hideSwitch（贴边隐藏开关）发生变化且被关闭，则先把窗口唤出到正常位置。
   * @param config 变更后的配置对象
   * @param diffKeys 发生变更的配置 key 数组
   */
  handleConfigChanged(config, diffKeys) {
    this.win?.setOpacity(local_store_default.alpha);
    this.win?.webContents?.send("app-config", config, diffKeys);
    if (diffKeys[0] == "hideSwitch") {
      if (config.hideSwitch == false) {
        this.showIfOnScreenBorder();
      }
      this.hideSwitch = config.hideSwitch;
    }
  }
  /**
   * 获取当前窗口 bounds。
   * @returns 窗口边界（未创建时为 undefined）
   */
  getBounds() {
    return this.win?.getBounds();
  }
  /**
   * 贴边隐藏：若窗口右边缘贴到屏幕右边缘，则几乎整个窗口移出屏幕（仅留 showSize 像素露出）；
   * 左边缘同理。执行后把 hideType 置为对应隐藏状态，并通知股票服务主面板不可见。
   * why：仅在 hideSwitch 开启时生效，且需要能匹配到所在显示器，否则返回。
   */
  hideIfOnScreenBorder() {
    if (this.hideSwitch == false) {
      return;
    }
    let bounds = this.win?.getBounds();
    let sb = import_electron6.screen.getDisplayMatching(bounds).bounds;
    if (!sb) {
      logger_default.log("sb invalide.");
      return;
    }
    let showSize = 5;
    if (bounds && bounds.x + bounds.width >= sb.x + sb.width) {
      let tox = sb.x + sb.width - showSize;
      let toy = bounds.y;
      this.setPosition(Math.floor(tox), Math.floor(toy));
      this.hideType = HIDE_TYPE_RIGHT;
      stock_default.setIndexWindowVisible(false);
    } else if (bounds && bounds.x <= sb.x) {
      let tox = sb.x + showSize - bounds.width;
      let toy = bounds.y;
      this.setPosition(Math.floor(tox), Math.floor(toy));
      this.hideType = HIDE_TYPE_LEFT;
      stock_default.setIndexWindowVisible(false);
    }
  }
  /**
   * 从贴边状态唤出显示：根据当前 hideType（右/左贴边）把窗口移回屏幕内正常位置，
   * 更新 hideType 为 *_SHOW 状态，通知股票服务主面板可见并强制刷新行情。
   */
  showIfOnScreenBorder() {
    if (this.hideSwitch == false) {
      return;
    }
    let bounds = this.win?.getBounds();
    if (!bounds) {
      logger_default.log("bounds invalide.");
      return;
    }
    let sb = import_electron6.screen.getDisplayMatching(bounds).bounds;
    if (this.hideType == HIDE_TYPE_RIGHT) {
      let tox = sb.x + sb.width - bounds.width;
      let toy = bounds.y;
      this.setPosition(Math.floor(tox), Math.floor(toy));
      this.hideType = HIDE_TYPE_RIGHT_SHOW;
      stock_default.setIndexWindowVisible(true);
      stock_default.forceUpdate();
    } else if (this.hideType == HIDE_TYPE_LEFT) {
      let tox = sb.x;
      let toy = bounds.y;
      this.setPosition(Math.floor(tox), Math.floor(toy));
      this.hideType = HIDE_TYPE_LEFT_SHOW;
      stock_default.setIndexWindowVisible(true);
      stock_default.forceUpdate();
    }
  }
  /**
   * 将主面板移动到主显示器居中位置。
   */
  setToCenter() {
    let bounds = this.win?.getBounds();
    let sb = import_electron6.screen.getPrimaryDisplay().bounds;
    let cx = sb.width / 2 - bounds.width / 2;
    let cy = sb.height / 2 - bounds.height / 2;
    cx = Math.floor(cx);
    cy = Math.floor(cy);
    this.setPosition(cx, cy);
  }
  /**
   * 显示窗口（重写基类，额外通知股票服务主面板可见）。
   */
  showOnScreen() {
    super.showOnScreen();
    stock_default.setIndexWindowVisible(true);
  }
  /**
   * 隐藏窗口（重写基类，额外通知股票服务主面板不可见）。
   */
  hideFromScreen() {
    super.hideFromScreen();
    stock_default.setIndexWindowVisible(false);
  }
};

// src/main/pages/LoginWindow.ts
var import_electron8 = require("electron");

// src/main/api/codffect.ts
var import_axios2 = __toESM(require("axios"));
var import_electron7 = require("electron");
var import_https2 = __toESM(require("https"));
var FormData = require("form-data");
var HttpsProxyAgent2 = require("https-proxy-agent");
var apiClient = import_axios2.default.create({
  baseURL: "https://www.baidu.com",
  // 云端服务地址
  timeout: 3e3,
  // 超时 3 秒
  httpsAgent: new import_https2.default.Agent({
    rejectUnauthorized: false
    // 忽略证书校验（原为兼容自签名/代理环境）
  })
});
var getPublicConfig = () => {
  let conf = local_store_default.config;
  let deviceid = conf.uuid;
  let os = process.platform;
  let osv = process.getSystemVersion();
  let appv = import_electron7.app.getVersion();
  let osa = "";
  if (["x32", "arm", "mips", "ia32", ""].includes(process.arch)) {
    osa = "32bit";
  } else if (["x64", "arm64", "ppc64"].includes(process.arch)) {
    osa = "64bit";
  }
  return {
    from: os,
    deviceid,
    os,
    osv,
    appv,
    osa
  };
};
apiClient.interceptors.request.use(function(config) {
  config.params = Object.assign(config.params, getPublicConfig());
  return config;
}, function(error) {
  return Promise.reject(error);
});
var codffect_default = {
  /** 微信登录：离线版禁用 */
  // 固定 reject('login-disabled')，向调用方表明登录功能已被禁用
  async loginWithWechat(code) {
    return Promise.reject("login-disabled");
  },
  /** 统计埋点上报：离线版空实现，恒返回 null，不真正上报 */
  async statisticPoke(common, postBody) {
    return null;
  },
  /** 日志/文件（zip）上传：离线版空实现，恒返回 null */
  async uploadFile(zipFilePath) {
    return null;
  },
  /** 用户反馈/建议上传：离线版空实现，恒返回 null */
  async sendAdvice(content) {
    return null;
  },
  /** 异常上报：仅打印本地日志，不真正上报，恒返回 null */
  async sendException(content) {
    console.log("sendException:" + content);
    return null;
  },
  /** 拉取云端配置：离线版空实现，恒返回 null */
  async getConfig(version) {
    return null;
  },
  /** 云端数据同步：离线版空实现，恒返回 null */
  async syncData(operation) {
    return null;
  },
  /** 获取商品（会员套餐）信息：离线版返回空数组，表示无可购买项 */
  async getGoodsInfo() {
    return [];
  },
  /** 获取支付链接：离线版空实现，恒返回 null */
  async getPayURL(goodID) {
    return null;
  },
  /** 查询支付状态：离线版空实现，恒返回 null */
  async getPayStatus(orderID) {
    return null;
  },
  /** 获取用户信息：离线版空实现，恒返回 null */
  async getUserInfo() {
    return null;
  },
  /** 网络连通性检测：离线版不做外部探测 */
  // 恒返回 false，不发起真实的联网探测
  async checkBaidu() {
    return false;
  },
  /** 填写邀请码：离线版空实现，恒返回 null */
  async fillInviteCode(Code) {
    return null;
  },
  /** 获取会员详情：离线版空实现，恒返回 null */
  async getVipDetail() {
    return null;
  },
  /** 代理连通性测试：离线版空实现，恒返回 null */
  async testProxy(host, port) {
    return null;
  }
};

// src/main/pages/LoginWindow.ts
var LoginWindow = class extends AppWindow {
  ///配置窗口参数
  configWindow(options) {
    options.width = 280;
    options.height = 400;
    options.title = "\u767B\u5F55";
  }
  ///窗口创建成功
  onWindowCreated(win) {
    win.loadWithRoute("/login");
    import_electron8.ipcMain.removeHandler("login");
    import_electron8.ipcMain.handle("login", async (event, type, dataUp) => {
      if (type === "device") {
        this.onLoginFinish?.call(this, null);
        win.close();
        win.destroy();
        return true;
      }
      if (type === "wechat") {
        let data = await codffect_default.loginWithWechat(dataUp);
        console.log("loginwin::::");
        console.log(data);
        local_store_default.applyWith({
          nickName: data.NickName,
          token: data.Token,
          avatar: data.Avatar,
          validTime: data.ValidTime,
          dueTo: data.DueTo,
          synUpdateTime: null,
          NewUser: data.NewUser,
          InviteUserID: data.InviteUserID,
          InviteCode: data.InviteCode
        });
        this.onLoginFinish?.call(this, data);
        win.close();
        win.destroy();
        return true;
      }
      return false;
    });
  }
  ///窗口关闭：移除 "login" ipc 处理器，避免残留/重复注册
  onWindowClosed() {
    import_electron8.ipcMain.removeHandler("login");
  }
};

// src/main/pages/SettingWindow.ts
var SettingWindow = class extends AppWindow {
  constructor() {
    super(...arguments);
    ///当前渲染路由（默认 /setting，可带子路由）
    this.route = "/setting";
    ///配置变更监听器（保存引用，便于管理）
    this.configListener = null;
  }
  /**
   * 配置窗口外观：固定宽 700、高 600，标题「设置」。
   * @param options 待修改的窗口构造参数
   */
  configWindow(options) {
    options.width = 700;
    options.height = 600;
    options.title = "\u8BBE\u7F6E";
  }
  /**
   * 设置窗口渲染路由（用于切换到具体设置子页面）。
   * @param route 目标路由，如 "/setting" 或带子路由的 "/setting/xxx"
   */
  setRoute(route) {
    this.route = route;
  }
  /**
   * 窗口创建成功回调：加载当前路由；注册配置变更监听器，
   * 将 appConfig 的 onConfig 事件转发到 handleConfigChanged。
   * @param win 创建完成的 BrowserWindow
   */
  onWindowCreated(win) {
    win.loadWithRoute(this.route);
    var that = this;
    this.configListener = (config, diffKeys) => {
      that.handleConfigChanged(config, diffKeys);
    };
    local_store_default.on("onConfig", this.configListener);
  }
  /**
   * 配置变更处理：将最新配置及变更 key 通过 ipc "app-config" 推送给渲染层，
   * 使设置页面实时同步最新配置状态。
   * @param config 变更后的配置对象
   * @param diffKeys 发生变更的配置 key 数组
   */
  handleConfigChanged(config, diffKeys) {
    this.win?.webContents?.send("app-config", config, diffKeys);
  }
};

// src/main/pages/VipWindow.ts
var VipWindow = class extends AppWindow {
  /**
   * 配置窗口外观：固定宽 700、高 700，标题「会员」。
   * @param options 待修改的窗口构造参数
   */
  configWindow(options) {
    options.width = 700;
    options.height = 700;
    options.title = "\u4F1A\u5458";
  }
  /**
   * 窗口创建成功回调：加载 "/vip" 路由渲染会员页面。
   * @param win 创建完成的 BrowserWindow
   */
  onWindowCreated(win) {
    win.loadWithRoute("/vip");
  }
};

// src/main/pages/SetCostWindow.ts
var SetCostWindow = class extends AppWindow {
  constructor() {
    super(...arguments);
    ///目标股票代码
    this.stockKey = null;
  }
  /**
   * 配置窗口外观：固定宽 380、高 460，标题「更多」；位置不强制居中（由系统/上次位置决定）。
   * @param options 待修改的窗口构造参数
   */
  configWindow(options) {
    options.width = 380;
    options.center = false;
    options.height = 460;
    options.title = "\u66F4\u591A";
  }
  /**
   * 窗口创建成功回调：校验股票代码是否存在，缺失则记录日志并放弃加载，
   * 否则加载 "/cost?key=<stockKey>" 路由渲染成本价设置页面。
   * @param win 创建完成的 BrowserWindow
   */
  onWindowCreated(win) {
    if (!this.stockKey) {
      logger_default.log("key missing.");
      return;
    }
    win.loadWithRoute("/cost?key=" + this.stockKey);
  }
  /**
   * 设置目标股票代码（窗口复用前更新股票）。
   * @param key 股票代码
   */
  setStock(key) {
    this.stockKey = key;
  }
  /**
   * 复用已有窗口刷新：通过 ipc "reload" 通道把新的 stockKey 推送给渲染层。
   * why：避免重复创建窗口，复用单例窗口更新展示的股票。
   */
  reload() {
    console.log("reload:" + this.stockKey);
    this.win?.webContents.send("reload", this.stockKey);
  }
};

// src/main/plugins/wechat.ts
var import_electron9 = require("electron");
var inited = false;
function WechatPlugin() {
  if (inited) {
    return;
  }
  inited = true;
  var wechatState = -2;
  import_electron9.session.defaultSession.webRequest.onBeforeRequest((detail, callback) => {
    if (detail.url.startsWith("https://gs.codeffect.top/user/login_wechat")) {
      let url = new URL(detail.url);
      let code = url.searchParams.get("code");
      detail.webContents?.send("wechat", 2, code);
      return;
    } else if (detail.url.startsWith("https://lp.open.weixin.qq.com/connect/l/qrconnect?uuid=")) {
      if (detail.url.indexOf("last=404") > 0) {
        wechatState = 1;
        detail.webContents?.send("wechat", 1, "\u626B\u7801\u6210\u529F");
      } else if (detail.url.indexOf("last=403") > 0) {
        if (wechatState == 1) {
          wechatState = -1;
          detail.webContents?.send("wechat", -1, "\u53D6\u6D88\u767B\u5F55");
        }
      } else {
        if (wechatState != 1) {
          wechatState = 0;
          detail.webContents?.send("wechat", 0, "");
        }
      }
    }
    callback({});
  });
}

// src/main/index.ts
var import_path3 = __toESM(require("path"));
var import_fs = __toESM(require("fs"));
var import_moment2 = __toESM(require("moment"));

// src/main/service/system.ts
var import_jszip = __toESM(require("jszip"));
var import_electron10 = require("electron");

// src/main/index.ts
var import_electron_dl = __toESM(require("electron-dl"));

// src/main/pages/InviteWindow.ts
var InviteWindow = class extends AppWindow {
  /**
   * 配置窗口外观：固定宽 331、高 404，无标题。
   * @param options 待修改的窗口构造参数
   */
  configWindow(options) {
    options.width = 331;
    options.height = 404;
    options.title = "";
  }
  /**
   * 窗口创建成功回调：加载 "/invite" 路由渲染邀请页面。
   * @param win 创建完成的 BrowserWindow
   */
  onWindowCreated(win) {
    win.loadWithRoute("/invite");
  }
};

// src/main/pages/ChartWindow.ts
var ChartWindow = class extends AppWindow {
  constructor() {
    super(...arguments);
    ///当前图表窗口展示的股票标识（股票代码；或对象形式便于携带多个查询参数）
    this.stockKey = null;
  }
  /**
   * 配置窗口外观：宽 400、高 285 的无边框窗口，标题「分时」。
   * 不透明度取配置的 alpha；若存在历史 chartBounds 则恢复窗口位置（宽高沿用默认，不恢复）。
   * @param options 待修改的窗口构造参数
   */
  configWindow(options) {
    options.width = 400;
    options.height = 285;
    options.title = "\u5206\u65F6";
    options.frame = false;
    let appConfig2 = local_store_default;
    options.opacity = appConfig2.alpha;
    if (local_store_default.config.chartBounds) {
      let bounds = local_store_default.config.chartBounds;
      options.x = bounds.x;
      options.y = bounds.y;
    }
  }
  /**
   * 窗口创建成功回调：根据 stockKey 的类型拼接路由查询串并加载。
   *   - 对象类型：把每个键值对拼成 `${k}=${v}` 再以 & 连接（支持多参数，如 key/code/period 等）；
   *   - 其他类型：直接按 `key=<stockKey>` 加载。
   * @param win 创建完成的 BrowserWindow
   */
  onWindowCreated(win) {
    if (typeof this.stockKey === "object") {
      let query = Object.keys(this.stockKey).map(((item) => {
        return `${item}=${this.stockKey[item]}`;
      }));
      win.loadWithRoute("/chart?" + query.join("&"));
    } else {
      win.loadWithRoute("/chart?key=" + this.stockKey);
    }
  }
  /**
   * 设置图表窗口展示的股票标识（用于窗口复用前更新目标股票）。
   * @param key 股票代码，或携带多个查询参数的对象
   */
  setStock(key) {
    this.stockKey = key;
  }
  /**
   * 复用已有窗口刷新：通过 ipc "reload" 通道把新的 stockKey 推送给渲染层，触发图表重载。
   * why：避免重复创建窗口，复用单例窗口仅更新内部数据。
   */
  reload() {
    console.log("reload:" + this.stockKey);
    this.win?.webContents.send("reload", this.stockKey);
  }
};

// src/main/pages/AdviceWindow.ts
var AdviceWindow = class extends AppWindow {
  /**
   * 配置窗口外观：固定宽 380、高 420，窗口标题「股票监控」。
   * @param options 待修改的窗口构造参数
   */
  configWindow(options) {
    options.width = 380;
    options.height = 420;
    options.title = "\u80A1\u7968\u76D1\u63A7";
  }
  /**
   * 窗口创建成功回调：加载 "/advice" 路由渲染反馈页面。
   * @param win 创建完成的 BrowserWindow
   */
  onWindowCreated(win) {
    win.loadWithRoute("/advice");
  }
};

// src/main/index.ts
var storage2 = require("electron-json-storage");
var alertDialog = {};
process.on("uncaughtException", function(error) {
  let exceptionStr = "uncaughtException:" + error + "|||" + error.stack;
  logger_default.log(exceptionStr);
  if (import_electron11.app.isPackaged) {
    codffect_default.sendException(exceptionStr);
  }
});
function checkInviteCode(data) {
  if (data == null) {
    return;
  }
  if (data.NewUser && data.InviteUserID == 0) {
    openNative(null, "invite", null);
  }
}
async function checkSyncData() {
  if (local_store_default.config.token == null || local_store_default.config.token == "") {
    return;
  }
  let data = await codffect_default.syncData(false);
  if (data == null) {
    return;
  }
  let sync = false;
  if (local_store_default.config.synUpdateTime == null) {
    sync = true;
  } else if (data.UpdatedTime == "" || !data.UpdatedTime) {
    sync = true;
  } else {
    let localTime = new Date(local_store_default.config.synUpdateTime);
    let remoteTime = new Date(data.UpdatedTime);
    if (remoteTime && remoteTime > localTime) {
      sync = true;
    }
  }
  if (sync) {
    let dynConf = JSON.parse(data.Data);
    local_store_default.applyWith(dynConf);
  }
}
if ((0, import_os.release)().startsWith("6.1")) import_electron11.app.disableHardwareAcceleration();
if (process.platform === "win32") import_electron11.app.setAppUserModelId(import_electron11.app.getName());
if (process.platform === "darwin" && import_electron11.app.isPackaged) {
  import_electron11.app.dock.hide();
}
if (!import_electron11.app.requestSingleInstanceLock()) {
  import_electron11.app.quit();
  process.exit(0);
}
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
function safeInit(name, fn) {
  try {
    fn();
  } catch (error) {
    logger_default.log(`[startup] ${name} failed: ${error?.message ?? error}`);
  }
}
var indexWindow = new IndexWindow();
indexWindow.hideSwitch = local_store_default.config.hideSwitch;
indexWindow.didShowCallBack = function() {
  service_default.forStockUpdate();
};
import_electron11.app.whenReady().then(function() {
  const conf = local_store_default.reloadFromUserData();
  if (conf.keys.length === 0) {
    conf.keys = [
      { code: "000001", marketCode: "sz", key: "sz000001", name: "\u5E73\u5B89\u94F6\u884C" },
      { code: "600036", marketCode: "sh", key: "sh600036", name: "\u62DB\u5546\u94F6\u884C" }
    ];
  }
  conf.profiteTotal = true;
  conf.save();
  logger_default.log("platform:" + process.platform);
  logger_default.log("sysVersion:" + process.getSystemVersion());
  logger_default.log("appVersion:" + import_electron11.app.getVersion());
  safeInit("SetUpProxy", () => SetUpProxy(local_store_default.config));
  safeInit("registerCountDown", () => registerCountDown());
  safeInit("createTray", () => createTray());
  safeInit("regiserIpcChannel", () => regiserIpcChannel());
  safeInit("registerGlobalShortcut", () => {
    if (local_store_default.config.shortCutsSwitch) {
      registerGlobalShortcut(local_store_default.config.shortCuts);
    }
  });
  safeInit("setLoginItemSettings", () => import_electron11.app.setLoginItemSettings({ openAtLogin: local_store_default.config.openAtLogin }));
  safeInit("checkSyncData", () => {
    void checkSyncData().catch((e) => logger_default.log("[startup] checkSyncData failed: " + e));
  });
  indexWindow.show();
  logger_default.log("direct show indexWindow");
  indexWindow.didShowCallBack && indexWindow.didShowCallBack();
}).catch((error) => {
  logger_default.log(`[startup] whenReady failed: ${error?.message ?? error}`);
});
import_electron11.app.on("window-all-closed", () => {
  import_electron11.globalShortcut.unregisterAll();
  import_electron11.app.quit();
});
import_electron11.app.on("will-quit", () => {
  import_electron11.globalShortcut.unregisterAll();
});
import_electron11.app.on("second-instance", () => {
  if (indexWindow.win) {
    if (indexWindow.win.isMinimized()) {
      indexWindow.win.restore();
    }
    indexWindow.win.focus();
  }
});
import_electron11.app.on("activate", () => {
  const allWindows = import_electron11.BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    indexWindow.show();
  }
});
import_electron11.app.on("before-quit", () => {
  statistic_default.poke("WillQuit.App", null);
  local_store_default.config.save();
});
function registerCountDown() {
  setInterval(() => {
    if (!AppWindow.isOpened("vip")) {
      let countDownTimeSec = local_store_default.config.countDownTimeSec;
      if (countDownTimeSec > 0) {
        countDownTimeSec = countDownTimeSec - 10;
        local_store_default.applyWith({ countDownTimeSec });
      }
    }
  }, 60 * 1e3);
}
function SetUpProxy(config) {
  let ps = config.proxySwitch;
  if (ps == false) {
    StockApi_default.cleanProxy();
  } else {
    StockApi_default.setProxy(ps.proxyHost, ps.proxyPort, ps.proxyUserName, ps.proxyPassWord);
  }
}
function registerGlobalShortcut(shortCuts) {
  import_electron11.globalShortcut.unregisterAll();
  import_electron11.globalShortcut.register(shortCuts.boss, () => {
    let visible = indexWindow.isShow();
    if (visible) {
      indexWindow.hideFromScreen();
    } else {
      indexWindow.showOnScreen();
    }
  });
  import_electron11.globalShortcut.register(shortCuts.adds, () => {
    openNative(null, "addstock", null);
  });
  let ADJ_CONST = 5;
  if (shortCuts.addo) {
    import_electron11.globalShortcut.register(shortCuts.mino, () => {
      let conf = local_store_default.config;
      conf.opa = conf.opa - ADJ_CONST;
      if (conf.opa < 0) {
        conf.opa = 0;
      }
      local_store_default.applyWith({ opa: conf.opa });
    });
  }
  if (shortCuts.mino) {
    import_electron11.globalShortcut.register(shortCuts.addo, () => {
      let conf = local_store_default.config;
      conf.opa = conf.opa + ADJ_CONST;
      if (conf.opa > 100) {
        conf.opa = 100;
      }
      local_store_default.applyWith({ opa: conf.opa });
    });
  }
  if (shortCuts.preg) {
    import_electron11.globalShortcut.register(shortCuts.preg, () => {
      indexWindow.win?.webContents.send("preg");
    });
  }
  if (shortCuts.nextg) {
    import_electron11.globalShortcut.register(shortCuts.nextg, () => {
      indexWindow.win?.webContents.send("nextg");
    });
  }
}
function openNative(_ipcEvent, winname, arg) {
  logger_default.logDebug("window:size: " + winname + " - " + arg);
  var window;
  if (winname == "login") {
    window = new LoginWindow();
    window.onLoginFinish = (data) => {
      checkInviteCode(data);
      checkSyncData();
      _ipcEvent.sender.send("loginOK");
    };
  } else if (winname == "setting") {
    window = new SettingWindow();
  } else if (winname == "vip") {
    window = new VipWindow();
  } else if (winname == "addstock") {
    window = new AddStockWindow();
  } else if (winname == "help") {
    window = new SettingWindow();
    window.setRoute("/setting/help");
  } else if (winname == "cost") {
    try {
      let old = AppWindow.winMap[winname];
      if (old && old.win) {
        old.win?.focus();
        old.setStock(arg);
        old.reload();
      } else {
        window = new SetCostWindow();
        window.setStock(arg);
      }
    } catch (e) {
      console.log(e);
    }
  } else if (winname == "ext") {
    if (arg.startsWith("https://") || arg.startsWith("http://")) {
      let InviteCode = local_store_default.config.InviteCode;
      if (InviteCode != null && InviteCode != "") {
        arg = arg + "&invite=" + InviteCode;
      }
    }
    import_electron11.shell.openExternal(arg);
  } else if (winname == "invite") {
    window = new InviteWindow();
  } else if (winname == "chart") {
    try {
      let old = AppWindow.winMap[winname];
      if (old && old.win) {
        old.win?.focus();
        old.setStock(arg);
        old.reload();
      } else {
        window = new ChartWindow();
        window.setStock(arg);
      }
    } catch (e) {
      console.log(e);
    }
  } else if (winname == "advice") {
    window = new AdviceWindow();
  }
  if (window) {
    window.setWinName(winname);
    let old = AppWindow.winMap[winname];
    if (old && old.win) {
      old.win?.focus();
      return;
    }
    AppWindow.addWinMap(winname, window);
    window.show();
  }
}
function regiserIpcChannel() {
  WechatPlugin();
  import_electron11.ipcMain.on("native::open", (_ipcEvent, winname, arg) => {
    openNative(_ipcEvent, winname, arg);
  });
  import_electron11.ipcMain.on("window:size", async (ipcEvent, width, height) => {
    let win = import_electron11.BrowserWindow.fromWebContents(ipcEvent.sender);
    if (win == null) {
      return;
    }
    logger_default.log("window:size: " + width + " - " + height);
    let bounds = win.getBounds();
    let ht = indexWindow.hideType;
    if (ht == 0 || ht == 1 || ht == 4) {
      bounds.x = bounds.x;
    } else {
      bounds.x = bounds.x + (bounds.width - width);
    }
    bounds.width = width;
    bounds.height = height;
    win.setBounds(bounds);
  });
  import_electron11.ipcMain.on("close-win", (ipcEvent) => {
    let win = import_electron11.BrowserWindow.fromWebContents(ipcEvent.sender);
    win?.close();
  });
  import_electron11.ipcMain.on("open-dev", (ipcEvent) => {
    ipcEvent.sender.openDevTools({ mode: "detach" });
  });
  import_electron11.ipcMain.on("statistic", (ipcEvent, eventKey, args) => {
    statistic_default.poke(eventKey, args);
  });
  import_electron11.ipcMain.removeHandler("api");
  import_electron11.ipcMain.handle("api", async (ipcEvent, command, arg, arg2) => {
    logger_default.logDebug("api: " + command + " - " + arg);
    if (command == "searchStock") {
      statistic_default.poke("Search", [arg]);
      let sugs = await StockApi_default.getSugs(arg);
      if (sugs.length < 10) {
        let sina_sugs = await StockApi_default.getSinaSugs(arg);
        sugs = sugs.concat(sina_sugs);
      }
      return { "token": arg, "data": sugs };
    } else if (command == "addStock") {
      return service_default.addStock(ipcEvent, arg);
    } else if (command == "goods") {
      return await codffect_default.getGoodsInfo();
    } else if (command == "payurl") {
      return await codffect_default.getPayURL(arg);
    } else if (command == "delStock") {
      return service_default.removeStock(ipcEvent, arg);
    } else if (command == "topStock") {
      return service_default.setTopStock(ipcEvent, arg);
    } else if (command == "sortKeys") {
      return service_default.sortKeys(arg);
    } else if (command == "paystatus") {
      return await codffect_default.getPayStatus(arg);
    } else if (command == "userinfo") {
      if (!local_store_default.config.token) {
        return;
      }
      let data = await codffect_default.getUserInfo();
      if (data) {
        let userInfo = {
          nickName: data.NickName,
          token: data.Token,
          avatar: data.Avatar,
          validTime: data.ValidTime,
          dueTo: data.DueTo,
          NewUser: data.NewUser,
          InviteUserID: data.InviteUserID,
          InviteCode: data.InviteCode
        };
        local_store_default.applyWith(userInfo);
        return userInfo;
      } else {
        return null;
      }
    } else if (command == "uploadLogs") {
      return await logger_default.compressAndSend();
    } else if (command == "isAeroGlassEnabled") {
      const sp = import_electron11.systemPreferences;
      return typeof sp.isAeroGlassEnabled === "function" ? sp.isAeroGlassEnabled() : false;
    } else if (command == "shortCut") {
      let newShortCuts = {};
      let shortCuts = local_store_default.config.shortCuts;
      newShortCuts = Object.assign(newShortCuts, shortCuts);
      newShortCuts = Object.assign(newShortCuts, arg);
      try {
        registerGlobalShortcut(newShortCuts);
      } catch (e) {
        logger_default.log(e.stack + "");
        return false;
      }
      local_store_default.applyWith({
        shortCuts: newShortCuts
      });
      return true;
    } else if (command == "log") {
      logger_default.log(arg);
    } else if (command == "checkTstock") {
      let sug = new Sug("000001", "sh");
      sug.extra = "ZS";
      sug.key = "sh000001";
      sug.market = "A\u80A1";
      sug.name = "\u4E0A\u8BC1\u6307\u6570";
      return await StockApi_default.getStocks([sug], false);
    } else if (command == "checkSstock") {
      let sug = new Sug("bc0", "qh");
      sug.extra = "sina_qh";
      sug.key = "nf_BC0";
      sug.market = "\u671F\u8D27";
      sug.name = "\u56FD\u9645\u94DC\u8FDE\u7EED";
      return await StockApi_default.getSinaStocks([sug]);
    } else if (command == "baidu") {
      return await codffect_default.checkBaidu();
    } else if (command == "openLogDir") {
      return logger_default.openLogDir();
    } else if (command == "fillInviteCode") {
      let data = await codffect_default.fillInviteCode(arg);
      if (data.code == 200 && data.data == true) {
        local_store_default.applyWith({ InviteUserID: 1 });
      }
      return data;
    } else if (command == "vipDetail") {
      return await codffect_default.getVipDetail();
    } else if (command == "fenshi") {
      return await StockApi_default.getFenShiData(arg);
    } else if (command == "getstock") {
      return service_default.getStock(arg);
    } else if (command == "exit") {
      statistic_default.poke("ExitStill.App", null);
      setTimeout(() => {
        import_electron11.app.quit();
      }, 600);
    } else if (command == "send_advice") {
      return await codffect_default.sendAdvice(arg);
    } else if (command == "configPath") {
      return local_store_default.getPath();
    } else if (command == "backupConfig") {
      const src = import_path3.default.join(storage2.getDataPath(), "stock-monitor-config.json");
      const stamp = (0, import_moment2.default)().format("YYYYMMDD-HHmmss");
      const result = await import_electron11.dialog.showSaveDialog({
        title: "\u5907\u4EFD\u914D\u7F6E",
        defaultPath: import_path3.default.join(import_electron11.app.getPath("desktop"), `stock-monitor-config-${stamp}.json`),
        filters: [{ name: "JSON \u6587\u4EF6", extensions: ["json"] }]
      });
      if (result.canceled || !result.filePath) return { ok: false, canceled: true };
      try {
        if (!import_fs.default.existsSync(src)) {
          import_fs.default.writeFileSync(src, JSON.stringify(local_store_default.config, null, 2));
        }
        import_fs.default.copyFileSync(src, result.filePath);
        logger_default.log("backupConfig -> " + result.filePath);
        return { ok: true, path: result.filePath };
      } catch (err) {
        logger_default.log("backupConfig err:" + err);
        return { ok: false, error: String(err) };
      }
    } else if (command == "restoreConfig") {
      const result = await import_electron11.dialog.showOpenDialog({
        title: "\u6062\u590D\u914D\u7F6E",
        properties: ["openFile"],
        filters: [{ name: "JSON \u6587\u4EF6", extensions: ["json"] }]
      });
      if (result.canceled || !result.filePaths || !result.filePaths.length) {
        return { ok: false, canceled: true };
      }
      try {
        const data = JSON.parse(import_fs.default.readFileSync(result.filePaths[0], "utf8"));
        if (typeof data !== "object" || data === null) {
          return { ok: false, error: "\u6587\u4EF6\u5185\u5BB9\u4E0D\u662F\u6709\u6548\u7684\u914D\u7F6E" };
        }
        const confirm = await import_electron11.dialog.showMessageBox({
          type: "warning",
          title: "\u6062\u590D\u914D\u7F6E",
          message: "\u6062\u590D\u5C06\u8986\u76D6\u5F53\u524D\u914D\u7F6E\u5E76\u81EA\u52A8\u91CD\u542F\u5E94\u7528\uFF0C\u786E\u5B9A\u7EE7\u7EED\uFF1F",
          buttons: ["\u53D6\u6D88", "\u786E\u5B9A\u6062\u590D"],
          defaultId: 0,
          cancelId: 0
        });
        if (confirm.response !== 1) return { ok: false, canceled: true };
        const dst = import_path3.default.join(storage2.getDataPath(), "stock-monitor-config.json");
        try {
          if (import_fs.default.existsSync(dst)) import_fs.default.copyFileSync(dst, `${dst}.bak-${Date.now()}`);
        } catch (backupErr) {
        }
        import_fs.default.writeFileSync(dst, JSON.stringify(data, null, 2), "utf8");
        logger_default.log("restoreConfig ok, relaunch");
        setTimeout(() => {
          import_electron11.app.relaunch();
          import_electron11.app.exit(0);
        }, 600);
        return { ok: true };
      } catch (err) {
        logger_default.log("restoreConfig err:" + err);
        return { ok: false, error: String(err) };
      }
    } else if (command == "testProxy") {
      return codffect_default.testProxy(arg.proxyHost, arg.proxyPort);
    } else if (command == "exception") {
      if (!import_electron11.app.isPackaged) {
        return false;
      }
      return await codffect_default.sendException(arg);
    } else if (command == "gpuInfo") {
      return import_electron11.app.getGPUFeatureStatus();
    } else if (command == "dayk") {
      return await StockApi_default.getDaykData(arg);
    } else if (command == "mk") {
      return await StockApi_default.getMkData(arg, arg2);
    }
  });
  import_electron11.ipcMain.removeHandler("config");
  import_electron11.ipcMain.handle("config", async (ipcEvent, command, arg) => {
    logger_default.log("config: " + command + " - " + arg);
    if (command == "get") {
      return local_store_default.config;
    } else if (command == "set") {
      local_store_default.applyWith(arg);
    } else if (command == "set_reload") {
      local_store_default.applyWith(arg);
      if (arg.openAtLogin == true) {
        import_electron11.app.setLoginItemSettings({ openAtLogin: true });
      } else if (arg.openAtLogin == false) {
        import_electron11.app.setLoginItemSettings({ openAtLogin: false });
      }
    } else if (command == "set_alias") {
      local_store_default.setAlias(arg.key, arg.alias);
    } else if (command == "getversion") {
      return import_electron11.app.getVersion();
    } else if (command == "set_cost") {
      local_store_default.setCost(arg.key, arg.price, arg.amount);
    } else if (command == "set_alert") {
      statistic_default.poke("Cost.Alert.CK", arg);
      local_store_default.setAlert(arg.key, arg);
    } else if (command == "set_shortcuts_switch") {
      if (arg.shortCutsSwitch == true) {
        import_electron11.globalShortcut.unregisterAll();
        let shortCuts = local_store_default.config.shortCuts;
        registerGlobalShortcut(shortCuts);
      } else if (arg.shortCutsSwitch == false) {
        import_electron11.globalShortcut.unregisterAll();
      }
      local_store_default.applyWith(arg);
    }
  });
  import_electron11.ipcMain.handle("window", async (ipcEvent, command, arg) => {
    logger_default.logDebug("window: " + command + " - " + arg);
    const win = import_electron11.BrowserWindow.fromWebContents(ipcEvent.sender);
    if (win == null) {
      return null;
    }
    if (command == "getpos") {
      let pos = win?.getPosition();
      return { x: pos[0], y: pos[1] };
    } else if (command == "setpos") {
      if (indexWindow.win == win) {
        indexWindow.hideType = 0;
      }
      let bounds = win.getBounds();
      let sf = import_electron11.screen.getDisplayMatching(bounds).scaleFactor;
      if (sf !== 1 && sf !== 2 && sf !== 3) {
        bounds.x = arg.x;
        bounds.y = arg.y;
        win?.setBounds(bounds);
        let newBounds = win.getBounds();
        let diffW = newBounds.width - bounds.width;
        let diffH = newBounds.height - bounds.height;
        if (diffW <= 2 && diffH <= 2 && diffW >= 0 && diffH >= 0) {
          bounds.width -= diffW;
          bounds.height -= diffH;
          win?.setBounds(bounds);
        }
      } else {
        win.setPosition(Math.floor(arg.x), Math.floor(arg.y));
      }
      return true;
    } else if (command == "checkhide" && win == indexWindow.win) {
      indexWindow.hideIfOnScreenBorder();
    } else if (command == "checkshow" && win == indexWindow.win) {
      statistic_default.poke("IW.mouseIn", null);
      indexWindow.showIfOnScreenBorder();
    } else if (command == "savebounds") {
      let bounds = win.getBounds();
      if (arg != "chart" && JSON.stringify(bounds) == JSON.stringify(local_store_default.config.bounds)) {
        console.log("bounds not change.dont save.");
        return;
      }
      local_store_default.editWith((cfg) => {
        if (arg == "chart") {
          cfg.chartBounds = bounds;
        } else {
          cfg.bounds = bounds;
        }
      });
    } else if (command == "contextmenu") {
    }
  });
}
var tray;
function createTray() {
  const ptoi = import_electron11.app.isPackaged ? import_path3.default.join(process.resourcesPath, "logo.png") : import_path3.default.join(__dirname, "../renderer", "logo.png");
  logger_default.log("path icon:" + ptoi);
  try {
    tray = new import_electron11.Tray(ptoi);
  } catch (error) {
    logger_default.log("Failed to create tray icon:" + error.message);
    tray = null;
  }
  if (tray == null) return;
  const contextMenu = import_electron11.Menu.buildFromTemplate([
    {
      label: "\u6253\u5F00\u8BBE\u7F6E\u9875\u9762",
      click: async function() {
        openNative(null, "setting", null);
      }
    },
    {
      label: "\u91CD\u7F6E\u8F6F\u4EF6",
      click: async function() {
        const options = {
          type: "info",
          title: "\u91CD\u7F6E\u8F6F\u4EF6\uFF1F",
          message: "\u91CD\u7F6E\u8F6F\u4EF6\uFF1F\u91CD\u7F6E\u540E\u6240\u6709\u914D\u7F6E\u4F1A\u6062\u590D\u5230\u521D\u59CB\u72B6\u6001.",
          buttons: ["\u5426", "\u662F"]
        };
        let index = await import_electron11.dialog.showMessageBox(options);
        if (index.response == 1) {
          local_store_default.restore();
          SetUpProxy(local_store_default.config);
        }
      }
    },
    {
      label: "\u6A21\u5F0F\u5207\u6362",
      click: function() {
        indexWindow.win?.webContents.send("uimodechange");
      }
    },
    {
      label: "\u9762\u677F\u5C45\u4E2D",
      click: async function() {
        const options = {
          type: "info",
          title: "\u627E\u4E0D\u5230\u9762\u677F\u4E86\uFF1F",
          message: "\u8BE5\u884C\u4E3A\u4F1A\u628A\u4F60\u9762\u677F\u653E\u5230\u5C4F\u5E55\u4E2D\u95F4\u5E76\u4E14\u663E\u793A\u51FA\u6765",
          buttons: ["\u5426", "\u662F"]
        };
        let index = await import_electron11.dialog.showMessageBox(options);
        if (index.response == 1) {
          indexWindow.setToCenter();
          indexWindow.showOnScreen();
        }
      }
    },
    {
      label: "\u4E0A\u4F20\u65E5\u5FD7",
      click: async function() {
        const options = {
          type: "info",
          title: "\u662F\u5426\u4E0A\u4F20\u65E5\u5FD7\uFF1F",
          message: "\u8BE5\u884C\u4E3A\u4F1A\u628A\u4F60\u7684\u8C03\u8BD5\u65E5\u5FD7\u4E0A\u4F20\u7ED9\u5F00\u53D1\u8005\u5E2E\u52A9\u5206\u6790\u95EE\u9898\u3002",
          buttons: ["\u5426", "\u662F"]
        };
        let index = await import_electron11.dialog.showMessageBox(options);
        if (index.response == 1) {
          await logger_default.compressAndSend();
        }
      }
    },
    {
      label: "\u9000\u51FA",
      click: function() {
        if (local_store_default.checkFirstLaunchAndQuickExit()) {
          statistic_default.poke("QuickExit.IM", null);
          openNative(null, "advice", null);
        } else {
          statistic_default.poke("CF.OUT", null);
          setTimeout(() => {
            import_electron11.app.quit();
          }, 700);
        }
      }
    }
  ]);
  tray.setToolTip("Stock-monitor");
  tray.setContextMenu(contextMenu);
  tray.on("double-click", function() {
    indexWindow.showIfOnScreenBorder();
    indexWindow.showOnScreen();
  });
  import_electron11.Menu.setApplicationMenu(null);
}
local_store_default.on("onConfig", async (config, diffKeys) => {
  let syncData = false;
  for (let i in diffKeys) {
    let k = diffKeys[i];
    if (k == "keys" || k == "cost" || k == "alias" || k == "alertInfos" || k == "groups") {
      syncData = true;
    }
  }
  if (syncData) {
    if (local_store_default.config.token && local_store_default.config.token != "") {
      let ret = await codffect_default.syncData(true);
      config.applyWith({ synUpdateTime: ret });
    }
  }
  if (diffKeys.length >= 1 && diffKeys[0] == "proxySwitch") {
    SetUpProxy(config);
  }
});
service_default.onEvent("alertPrice", async function(arg) {
  if (alertDialog[arg.key]) {
    logger_default.log(arg.key + " already alert.");
    return;
  }
  alertDialog[arg.key] = true;
  const options = {
    type: "info",
    title: "\u63D0\u9192",
    message: arg.text,
    buttons: ["\u77E5\u9053\u4E86", "\u4E0D\u518D\u63D0\u9192"]
  };
  let index = await import_electron11.dialog.showMessageBox(options);
  if (index.response == 1) {
    local_store_default.setAlert(arg.key, { key: arg.key, at: arg.at, v: false });
  }
  delete alertDialog[arg.key];
});
//# sourceMappingURL=index.cjs.map
