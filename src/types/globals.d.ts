/**
 * 原项目给 Electron 内置对象打的扩展，补上类型声明后编辑器与
 * `npm run typecheck` 才能正确识别这些成员。
 */

declare module 'electron' {
  interface BrowserWindow {
    /** 由 src/extensions/electron_extensions.ts 挂载 */
    loadWithRoute(url: string): void
  }
}

declare global {
  interface Window {
    /** 由 src/preload/index.ts 挂载，渲染层就绪后移除加载动画 */
    removeLoading: () => void
  }
}

export {}
