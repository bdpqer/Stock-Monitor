# Stock-Monitor

> 轻量级 Windows 桌面自选股看盘工具，基于 Electron + Vue 3。置顶悬浮、透明窗口、老板键，行情直连腾讯 / 新浪公开接口。

## ⚠️ 仓库说明

- 本仓库为**离线个人维护版**。主进程与 preload 的 TypeScript 源码已恢复到 `src/`，并配好可复现构建链；**渲染层 Vue 源码不可恢复**（产物没有 sourcemap），`dist/renderer/*.js` 按「冻结产物 + 外挂补丁」维护。
- 源码来源：`dist/main/index.cjs.map` 与 preload 内联 sourcemap 的 `sourcesContent`（共 25 个 TS 文件），由 `scripts/restore-sources.mjs` 一次性引导恢复。恢复出的是**在线版**源码，离线化改造已另行回归到 `src/`，详见「开发与维护」。
- 原项目的云端账号、支付、统计、邀请服务已 stub 化，功能离线可用，无需登录。
- 基于第三方项目二次维护，仅供个人学习研究；对外分发前请自行确认原项目授权。`package.json` 中声明 MIT，但仓库未附 LICENSE 文件。

## ✨ 功能

| 模块 | 说明 |
|---|---|
| 实时行情 | 自选股报价，腾讯 + 新浪双源，GBK 解码，前台 3.2s / 隐藏 15s 轮询 |
| 图表 | ECharts 分时图、日 K 线（前复权，180 日）、分钟 K 线 |
| 自选股管理 | 添加 / 删除 / 置顶、别名备注、首列拖拽排序、分组 |
| 成本与提醒 | 成本价、持仓金额、盈亏估算、上下破价提醒 |
| 窗口 | 无边框置顶、透明度、贴边隐藏、开机自启、全局快捷键（老板键 Alt + 反引号） |
| 配置 | 本地 JSON 持久化，设置页支持一键备份 / 恢复（恢复后自动重启） |

> 功能边界：这是**自选股看盘**工具，不含全市场涨跌幅榜、热点板块轮动、资金面分析与定时推送。

## 🔧 离线版改动

| 改动 | 位置 |
|---|---|
| 会员状态本地恒真 | `src/main/storage/local_store.ts` |
| 云端 API 全部 stub：登录 / 支付 / 统计 / 邀请 / 代理 / 异常上报 | `src/main/api/codffect.ts` |
| 关闭日志落盘与统计上报 | `src/main/service/logger.ts`、`src/main/service/statistic.ts` |
| 拖拽排序 IPC `api/sortKeys` | `src/main/index.ts`、`src/main/service/index.ts` + `src/renderer/patches/drag-sort.js` |
| 配置备份 / 恢复 IPC `api/backupConfig`、`api/restoreConfig` | `src/main/index.ts` + `dist/renderer/doctor.*.js`（冻结 UI） |

## 📡 数据源

| 用途 | 接口 |
|---|---|
| 实时报价 | `web.sqt.gtimg.cn`（腾讯）、`hq.sinajs.cn`（新浪） |
| 股票搜索 | `smartbox.gtimg.cn`（腾讯）、`suggest3.sinajs.cn`（新浪） |
| K 线 / 分时 | `proxy.finance.qq.com`、`ifzq.gtimg.cn`、`web.ifzq.gtimg.cn` |

均为第三方公开接口，无 SLA 保证；接口变更或限流会影响行情显示。

## 📁 目录结构

```
Stock-Monitor/
├── src/
│   ├── main/                    # 主进程 TypeScript 源码（22 个文件，可编辑）
│   ├── preload/                 # preload TypeScript 源码（3 个文件）
│   ├── extensions/              # BrowserWindow.loadWithRoute 扩展
│   ├── types/globals.d.ts       # Electron / Window 扩展类型声明
│   └── renderer/patches/        # 渲染层可维护补丁（drag-sort.js + 说明）
├── scripts/
│   ├── restore-sources.mjs      # 一次性：从原始 sourcemap 引导恢复源码
│   ├── build-main.mjs           # esbuild 重建主进程 / preload 产物
│   ├── inject-renderer.mjs      # 幂等注入渲染层补丁，--check 可校验
│   └── smoke-test.mjs           # 纯 Node 加载冒烟测试
├── dist/                        # 构建产物：main / preload / renderer
├── icons/                       # 各尺寸应用图标
├── dist-electron/               # 安装包输出（被 .gitignore 忽略）
├── tsconfig.json
├── package.json
└── README.md
```

## 🛠️ 开发与维护

主进程与 preload **完全可维护**：改 `src/` → 重建 → 校验 → 打包，不再需要手工改压缩产物。

```bash
npm install

npm run build:main        # src/ → dist/main/index.cjs + dist/preload/index.cjs
npm run build:renderer    # 把 src/renderer/patches/ 注入 dist/renderer（幂等）
npm run typecheck         # tsc --noEmit，当前 0 错误
npm run smoke             # 用 mock electron 加载主进程产物，验证依赖与初始化
npm run check:patches     # 校验全部离线补丁是否齐全（含防回退到在线版）
npm start                 # 启动 Electron（需先 build:main）
```

**关键点**

- sourcemap 恢复出来的是**在线版**源码。离线化改造（会员恒真、云端 stub、日志/统计禁用、拖拽排序、配置备份）已全部回归成 TS 源码，因此 `build:main` 生成的产物不会重新联网；`check:patches` 会检查产物中不含云端 API 路径。
- `dist/renderer/` 无 sourcemap，`.vue` 组件不可还原。可维护部分放在 `src/renderer/patches/`，冻结产物与完整补丁清单见 [src/renderer/patches/README.md](src/renderer/patches/README.md)。
- `restore-sources.mjs` 只是历史引导工具，源码已在 `src/`，正常开发无需再运行；新 sourcemap 由 `build-main.mjs` 生成并直接指向 `src/`。
- 构建策略与原始产物一致：esbuild 输出 CJS、`packages: external`，因此产物可直接被 `package.json` 的 `main` 加载，也能被 electron-builder 原样打包。
- **启动流程同样曾是静默补丁**：sourcemap 里的 `whenReady()` 是在线版（按 `token` 决定先弹微信登录窗），且没有显式设置配置存储路径。离线版必须跳过登录窗、从 `userData` 重建配置单例、强制 `profiteTotal=true`；托盘图标要用 `logo.png`（打包后 `build/icons/` 不存在）；设备 ID 读取要容错。这些已回归 `src/main/index.ts` 与 `src/main/storage/local_store.ts`，`check:patches` 有对应的防回退校验。

## 🚀 打包

```bash
npm run build        # electron-builder，生成 Windows 安装包
```

- 输出目录 `dist-electron/`：`Stock-monitor Setup 1.0.0.exe`（NSIS 安装包）、`Stock-monitor 1.0.0.exe`（便携版）、`win-unpacked/`、`latest.yml`、`.blockmap`。
- 首次打包需下载 Electron 40.1.0 win-x64 二进制与 NSIS 工具链；建议预留 2 GB 以上磁盘空间。
- 安装包单文件约 117 MB，超过 GitHub 单文件 100 MB 限制，**不纳入 Git**，通过 Release 附件分发。
- `latest.yml` 中的文件名为 `Stock-monitor-Setup-1.0.0.exe`（短横线），与磁盘上的带空格文件名不同；GitHub 又会把附件名空格规范化为点号，作为更新源使用时需按实际附件名对齐。

## 💾 配置与数据

自选股、成本价、分组、价格提醒、快捷键、主题等保存在 electron-json-storage 数据目录下的 `stock-monitor-config.json`。实际路径是 **`%APPDATA%/Stock-Monitor/stock-monitor-config.json`**（userData 根目录），不是 `storage/` 子目录——启动时 `reloadFromUserData()` 会显式把 dataPath 指过去。设置页的「备份配置」可导出到桌面，「恢复配置」会先留存当前配置再覆盖并自动重启。

## 🩺 启动与故障排查

| 现象 | 原因 | 处理 |
|---|---|---|
| 进程还在，但没有主界面 | 旧产物按 `token` 走已被禁用的登录窗；或托盘图标 `build/icons/24x24.png` 不存在，抛错中断 `whenReady` | 用本仓库源码重新 `npm run build:main`。新版跳过登录窗、改用 `logo.png`，且所有非关键初始化由 `safeInit()` 兜底，主窗口一定最后创建 |
| `REG.exe ... MachineGuid Access is denied` | `node-machine-id` 读注册表被组策略或沙箱拒绝，顶层 `new Config()` 崩溃 | `safeMachineId()` 已降级为本地随机 UUID；离线版不依赖云端设备标识 |
| `npm start` 报 `BrowserWindow.prototype` undefined | 终端注入了 `ELECTRON_RUN_AS_NODE=1`，Electron 以纯 Node 模式启动 | `env -u ELECTRON_RUN_AS_NODE npm start`；双击 exe 不受影响 |
| 窗口出现但没有自选股/行情 | 读到了 `userData/storage/` 下的空配置 | 新版启动时会重建配置单例；确认 `%APPDATA%/Stock-Monitor/stock-monitor-config.json` 存在 |

`npm start` 在没有 Vite dev server 时会自动回退加载 `dist/renderer/index.html`，因此可直接本地运行已构建产物。

## 🔒 已知风险

| 级别 | 问题 |
|---|---|
| 高 | `nodeIntegration: true` + `contextIsolation: false`，preload 未使用 contextBridge |
| 中 | 渲染层 Vue 源码不可恢复，只能以冻结产物 + 注入补丁维护 |
| 中 | HTTPS 请求关闭证书校验（`rejectUnauthorized: false`） |
| 中 | `shell.openExternal` 未做域名白名单校验 |
| 中 | 会员恒真导致 3.2s 高频轮询，可能被行情接口限流 |
| 低 | `app.asar` 内含主进程 sourcemap（含源码文本），分发前建议移除 |
| 低 | 依赖版本偏旧（Vue 3.2 / Element Plus 2.1.11 / axios 0.27）而 Electron 为 40.x |

## 📌 版本

v1.0.0 · Electron 40.1.0 · electron-builder 24.13.3 · esbuild 构建链
