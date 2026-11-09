// 模块职责：提供 useLoading 工具，向页面 head/body 注入一个「方块旋转」加载动画
// （一段内联 CSS 关键帧 + 一个 div 结构），并返回安全的追加/移除方法。
// 动画样式参考自以下开源的 loading 方案（本项目只取用其一）：
/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
export function useLoading() {
  // 旋转方块的样式类名，动画关键帧会挂到该类的子元素上
  const className = `loaders-css__square-spin`
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `
  // style 节点 + div 节点各一次性创建并复用，避免重复创建 DOM 造成泄漏
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  // style 写入动画关键帧并给出固定 id，便于定位
  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  // div 作为动画容器（全屏居中遮罩），内部套一个旋转方块
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`

  return {
    // 把动画样式与容器分别追加到 head / body，实现显示加载动画
    appendLoading() {
      safe.append(document.head, oStyle)
      safe.append(document.body, oDiv)
    },
    // 渲染层业务就绪后调用，从 head / body 移除动画样式与容器
    removeLoading() {
      safe.remove(document.head, oStyle)
      safe.remove(document.body, oDiv)
    },
  }
}

// safe 对象：对 DOM 的 append/remove 做「幂等」防护，防止重复插入或删除不存在的节点
const safe = {
  append(parent: HTMLElement, child: HTMLElement) {
    // 仅当目标节点尚未存在于父节点时才是真正的追加
    if (!Array.from(parent.children).find(e => e === child)) {
      return parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    // 仅当节点确实存在于父节点时才移除，避免 removeChild 抛错
    if (Array.from(parent.children).find(e => e === child)) {
      return parent.removeChild(child)
    }
  },
}
