/**
 * 主进程产物加载冒烟测试（纯 Node，不需要启动 Electron 窗口）。
 *
 * 用一个最小的 electron mock 加载 dist/main/index.cjs，验证：
 *   - 所有 require 依赖都能解析
 *   - 顶层模块初始化不会立即抛错
 *   - 离线化 stub、行情接口等关键代码确实在产物里
 *
 * whenReady() 故意返回一个永不 resolve 的 Promise，因此不会执行创建窗口、
 * 托盘、快捷键等需要真实 Electron 环境的启动逻辑。
 *
 *   node scripts/smoke-test.mjs
 */
import Module from 'node:module'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)

class Emitter {
  on() { return this }
  once() { return this }
  removeListener() { return this }
  emit() { return false }
}

const appBase = Object.assign(new Emitter(), {
  isPackaged: false,
  getVersion: () => '1.0.0',
  getName: () => 'Stock-monitor',
  getPath: () => os.tmpdir(),
  getSystemVersion: () => '10.0.0',
  requestSingleInstanceLock: () => true,
  whenReady: () => new Promise(() => {}),
  quit() {}, exit() {}, relaunch() {},
  setLoginItemSettings() {},
  dock: { hide() {} },
})

// Electron 不同版本/平台会调用若干 app.* 辅助方法，未知的统统降级为 noop
const app = new Proxy(appBase, {
  get(target, prop) {
    if (prop in target) return target[prop]
    return () => {}
  },
})

class BrowserWindow extends Emitter {
  static getAllWindows() { return [] }
  static fromWebContents() { return null }
  constructor() {
    super()
    this.webContents = Object.assign(new Emitter(), {
      send() {}, openDevTools() {}, on() { return this },
      session: { webRequest: { onBeforeSendHeaders() {} } },
    })
  }
  loadURL() {}
  show() {}
  hide() {}
  focus() {}
  reload() {}
  setAlwaysOnTop() {}
  setOpacity() {}
  getPosition() { return [0, 0] }
  setPosition() {}
  isVisible() { return false }
  destroy() {}
}

class Tray extends Emitter {
  setToolTip() {}
  setContextMenu() {}
}

const mockElectron = {
  app,
  BrowserWindow,
  Tray,
  ipcMain: { handle() {}, on() {}, removeHandler() {} },
  globalShortcut: { register() {}, unregisterAll() {} },
  Menu: { buildFromTemplate: () => ({}), setApplicationMenu() {} },
  dialog: {
    showSaveDialog: async () => ({ canceled: true }),
    showOpenDialog: async () => ({ canceled: true }),
    showMessageBox: async () => ({ response: 0 }),
  },
  shell: { openExternal() {}, openPath: async () => '' },
  screen: { getPrimaryDisplay: () => ({ bounds: { x: 0, y: 0, width: 1920, height: 1080 } }) },
  webContents: { getAllWebContents: () => [], fromId: () => null },
  systemPreferences: { isAeroGlassEnabled: () => false },
}

// node-machine-id 在某些无系统命令的环境会失败，这里给出稳定的测试值
const machineId = { machineIdSync: () => 'smoke-test-machine-id' }

const originalLoad = Module._load
Module._load = function (request, parent, isMain) {
  if (request === 'electron') return mockElectron
  if (request === 'node-machine-id') return machineId
  return originalLoad.call(this, request, parent, isMain)
}

const bundlePath = path.join(root, 'dist/main/index.cjs')
let failed = 0
try {
  require(bundlePath)
  console.log('OK   主进程 bundle 加载成功（依赖解析与顶层初始化正常）')
} catch (error) {
  console.error('FAIL 主进程 bundle 加载失败:', error && error.stack ? error.stack : error)
  failed++
} finally {
  Module._load = originalLoad
}

const source = fs.readFileSync(bundlePath, 'utf8')
for (const [label, keyword] of [
  ['拖拽排序 IPC', 'sortKeys'],
  ['配置备份 IPC', 'backupConfig'],
  ['配置恢复 IPC', 'restoreConfig'],
  ['离线登录 stub', 'login-disabled'],
  ['腾讯行情接口', 'web.sqt.gtimg.cn'],
]) {
  const ok = source.includes(keyword)
  console.log(`${ok ? 'OK  ' : 'FAIL'}  ${label}`)
  if (!ok) failed++
}

console.log(failed === 0 ? '冒烟测试通过' : `冒烟测试失败（${failed} 项）`)
if (failed > 0) process.exitCode = 1
