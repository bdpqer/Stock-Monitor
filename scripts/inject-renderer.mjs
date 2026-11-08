/**
 * 渲染层补丁注入与校验（幂等）。
 *
 * 渲染层 Vue 源码已不可恢复（没有 sourcemap），dist/renderer/*.js 属于
 * 冻结产物。可维护的部分放在 src/renderer/patches/：
 *   - drag-sort.js：自选股拖拽排序脚本，注入到 index.html
 *   - 两处文案替换规则（见下方 textPatches）
 *   - doctor.*.js 的备份 UI 是压缩过的 Vue render function，只能冻结保留
 *
 *   node scripts/inject-renderer.mjs            # 应用补丁
 *   node scripts/inject-renderer.mjs --check    # 只校验，不修改
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const checkOnly = process.argv.includes('--check')
const rendererDir = path.join(root, 'dist/renderer')
const patchDir = path.join(root, 'src/renderer/patches')
const START = '<!-- sm:drag-sort:start -->'
const END = '<!-- sm:drag-sort:end -->'

let failed = 0
function report(name, state, detail = '') {
  console.log(`${state ? 'OK  ' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`)
  if (!state) failed++
}

// 1. 拖拽排序脚本：始终以 src/renderer/patches/drag-sort.js 为唯一来源
const dragSource = fs.readFileSync(path.join(patchDir, 'drag-sort.js'), 'utf8').trim()
const htmlPath = path.join(rendererDir, 'index.html')
let html = fs.readFileSync(htmlPath, 'utf8')
const marked = html.includes(START) && html.includes(END)

if (checkOnly) {
  report('index.html 拖拽排序脚本', marked && html.includes('sm-drop-before'), marked ? '标记块存在' : '缺少注入标记块')
} else {
  html = html.replace(new RegExp(`${START}[\\s\\S]*?${END}\\s*`, 'g'), '')
  html = html.replace(/<script>\s*\/\* 自选股拖拽排序[\s\S]*?<\/script>\s*/g, '')
  const block = `${START}\n<script>\n${dragSource}\n</script>\n${END}\n`
  if (!html.includes('</body>')) throw new Error('index.html 中找不到 </body>')
  html = html.replace('</body>', block + '</body>')
  fs.writeFileSync(htmlPath, html, 'utf8')
  report('index.html 拖拽排序脚本', true, '已由 drag-sort.js 注入')
}

// 2. 压缩产物里的文案替换规则（字符串是 JS 源码中的 \uXXXX 字面量）
const textPatches = [
  {
    file: 'index.237cad89.js',
    from: '\\u6545\\u969C\\u8BCA\\u65AD',
    to: '\\u5907\\u4EFD\\u914D\\u7F6E',
    label: '设置菜单文案 → 备份配置',
  },
  {
    file: 'index.e4b3f4eb.js',
    from: 'name:"\\u7F51\\u7EDC\\u8BCA\\u65AD"',
    to: 'name:"\\u5907\\u4EFD\\u914D\\u7F6E"',
    label: 'doctor 路由名称 → 备份配置',
  },
]

for (const rule of textPatches) {
  const file = path.join(rendererDir, rule.file)
  if (!fs.existsSync(file)) {
    report(rule.label, false, '产物文件缺失: ' + rule.file)
    continue
  }
  let content = fs.readFileSync(file, 'utf8')
  const applied = content.includes(rule.to)
  const pending = content.includes(rule.from)
  if (!checkOnly && pending) {
    content = content.split(rule.from).join(rule.to)
    fs.writeFileSync(file, content, 'utf8')
  }
  const good = (!checkOnly && (applied || pending)) || (checkOnly && applied && !pending)
  report(rule.label, good, checkOnly ? (applied ? '补丁已应用' : '补丁缺失') : (pending ? '已替换' : '已是最新'))
}

// 3. 冻结产物：doctor 组件与主进程补丁
const doctorPath = path.join(rendererDir, 'doctor.63ab51ad.js')
const doctor = fs.existsSync(doctorPath) ? fs.readFileSync(doctorPath, 'utf8') : ''
report('doctor 备份/恢复 UI（冻结产物）', doctor.includes('backupConfig') && doctor.includes('restoreConfig'), '仅校验，不重新生成')

const mainPath = path.join(root, 'dist/main/index.cjs')
const main = fs.existsSync(mainPath) ? fs.readFileSync(mainPath, 'utf8') : ''
const mainChecks = [
  ['主进程产物包含 sortKeys', () => main.includes('sortKeys')],
  ['主进程产物包含 backupConfig', () => main.includes('backupConfig')],
  ['主进程产物包含 restoreConfig', () => main.includes('restoreConfig')],
  ['登录服务为离线 stub', () => main.includes('login-disabled')],
  ['会员校验本地恒真', () => /isVip\(\)\s*\{\s*return true/.test(main)],
  ['未回归云端 API 调用', () => !main.includes('/user/login_wechat2') && !main.includes('/statistic/logfile')],
  // 离线启动流程：这几项曾只存在于压缩产物中，漏掉会导致「运行没有主界面」
  ['离线启动：从 userData 重建配置', () => main.includes('reloadFromUserData') && main.includes('setDataPath')],
  ['离线启动：强制开启盈亏合计', () => /profiteTotal\s*=\s*true/.test(main)],
  ['离线启动：跳过登录窗直达主界面', () => main.includes('direct show indexWindow') && !main.includes('login.show(')],
  ['离线启动：显示后立即刷新行情', () => main.includes('indexWindow.didShowCallBack && indexWindow.didShowCallBack()')],
  ['设备 ID 读取容错（注册表不可用时）', () => main.includes('safeMachineId') && main.includes('randomUUID')],
  ['托盘图标使用 logo.png', () => main.includes('"logo.png"') && !main.includes('assetsPath')],
  ['启动阶段容错（任一初始化失败仍显示主窗）', () => main.includes('safeInit') && main.includes('whenReady failed')],
]
for (const [label, check] of mainChecks) report(label, check())

console.log(checkOnly ? '校验结束' : '补丁注入结束')
if (failed > 0) {
  console.error(`有 ${failed} 项未通过`)
  process.exitCode = 1
}
