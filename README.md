# Stock-Monitor

> 轻量级 Windows 桌面自选股看盘工具，基于 Electron + Vue 3。置顶悬浮、透明窗口、老板键，行情直连腾讯 / 新浪公开接口。

## ⚠️ 仓库说明

- 本仓库为**离线个人维护版**，提交的是**构建产物**（`dist/`、`icons/`）与打包配置，**不含 TypeScript / Vue 源码，也不含前端构建链**。
- 主进程原始源码可从 `dist/main/index.cjs.map` 的 `sourcesContent` 还原（`packages/main/*`，22 个 TS 文件）；渲染层无 sourcemap，只有压缩后的 JS。
- 原项目的云端账号、支付、统计、邀请服务已本地化处理，功能离线可用，无需登录。
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
| 会员状态本地恒真 | `local_store.ts`（见 sourcemap） |
| 云端 API 全部 stub：登录 / 支付 / 统计 / 邀请 / 代理 / 异常上报 | `codffect.ts` |
| 关闭日志落盘与统计上报 | `logger.ts`、`statistic.ts` |
| 股票名首列拖拽排序，IPC `api/sortKeys` | `dist/renderer/index.html` 内联脚本 + 主进程补丁 |
| 配置备份 / 恢复，IPC `api/backupConfig`、`api/restoreConfig` | `dist/renderer/doctor.*.js` + 主进程补丁 |

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
├── dist/
│   ├── main/index.cjs           # Electron 主进程（含 sourcemap）
│   ├── preload/index.cjs        # 加载动画
│   └── renderer/                # Vue 3 前端产物（index.html + 分包 JS）
├── icons/                       # 各尺寸应用图标
├── dist-electron/               # 打包输出（被 .gitignore 忽略）
├── package.json                 # electron-builder 配置
└── README.md
```

## 🚀 构建

```bash
npm install
npm run build        # electron-builder，仅重新打包现有 dist/，不重新编译前端
```

- 输出目录 `dist-electron/`：`Stock-monitor Setup 1.0.0.exe`（NSIS 安装包）、`Stock-monitor 1.0.0.exe`（便携版）、`win-unpacked/`、`latest.yml`、`.blockmap`。
- 首次打包需下载 Electron 40.1.0 win-x64 二进制与 NSIS 工具链；建议预留 2 GB 以上磁盘空间。
- 安装包单文件约 117 MB，超过 GitHub 单文件 100 MB 限制，**不纳入 Git**，通过 Release 附件分发。
- `latest.yml` 中的文件名为 `Stock-monitor-Setup-1.0.0.exe`（短横线），与磁盘上的带空格文件名不同；作为更新源使用时需重命名。

## 💾 配置与数据

自选股、成本价、分组、价格提醒、快捷键、主题等保存在 electron-json-storage 数据目录下的 `stock-monitor-config.json`。设置页的「备份配置」可导出到桌面，「恢复配置」会先留存当前配置再覆盖并自动重启。

## 🔒 已知风险

| 级别 | 问题 |
|---|---|
| 高 | `nodeIntegration: true` + `contextIsolation: false`，preload 未使用 contextBridge |
| 高 | 无前端源码与构建链，后续改动只能直接修改压缩产物 |
| 中 | HTTPS 请求关闭证书校验（`rejectUnauthorized: false`） |
| 中 | `shell.openExternal` 未做域名白名单校验 |
| 中 | 会员恒真导致 3.2s 高频轮询，可能被行情接口限流 |
| 低 | `app.asar` 内含主进程 sourcemap，分发前建议移除 |
| 低 | 依赖版本偏旧（Vue 3.2 / Element Plus 2.1.11 / axios 0.27）而 Electron 为 40.x |

## 📌 版本

v1.0.0 · Electron 40.1.0 · electron-builder 24.13.3
