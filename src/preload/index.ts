// 模块职责：preload 脚本入口，在渲染进程加载早期注入「方块旋转」加载动画。
// 本项目开启了 nodeIntegration，preload 未通过 contextBridge 暴露能力，而是直接
// 往 window 上挂方法；渲染层在自身业务就绪后调用 window.removeLoading() 移除动画。
import { domReady } from './utils'
import { useLoading } from './loading'

// 取用 loading 工具返回的注入/移除方法，并直接挂到 window 供渲染层调用
const { appendLoading, removeLoading } = useLoading()
window.removeLoading = removeLoading

// 等文档 ready 后立刻追加加载动画（避免 DOM 尚未就绪时插入失败）
domReady().then(appendLoading)

