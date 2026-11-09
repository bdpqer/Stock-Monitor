
// 模块职责：提供 domReady 工具，返回一个在文档就绪后 resolve 的 Promise，
// 供 preload 在正确时机注入加载动画。

/** docoment ready */
export function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  // 参 condition：允许的文档就绪状态列表，默认 complete 或 interactive 任一满足即认为就绪
  return new Promise(resolve => {
    // 若当前 readyState 已命中目标状态，则立即以 true 完成；否则监听变化直至命中
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}
