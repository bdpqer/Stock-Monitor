/**
 * 从构建产物内的 sourcemap 恢复 TypeScript 源码。
 *
 * 这个仓库最初只提交了 dist/ 产物，没有源码。dist/main/index.cjs.map 与
 * dist/preload/index.cjs 内联的 sourcemap 里保留了 sourcesContent，因此
 * 可以完整还原主进程与 preload 的原始 TS 文件。
 *
 * 这是一次性引导脚本：只适用于仓库里最初那份产物 sourcemap
 * （source 路径形如 ../../packages/...）。源码已经恢复到 src/ 之后无需
 * 再运行；后续 sourcemap 由 scripts/build-main.mjs 生成，直接指向 src/。
 *
 * 用法：
 *   node scripts/restore-sources.mjs            # 只写不存在的文件（安全）
 *   node scripts/restore-sources.mjs --force    # 覆盖 src/ 中已有文件（会丢失手工修改）
 *
 * 渲染层（packages/renderer）没有 sourcemap，无法还原，见 README。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const force = process.argv.includes('--force')

function sourceToRelative(sourcePath) {
  const normalized = sourcePath.replace(/\\/g, '/')
  const marker = 'packages/'
  const index = normalized.indexOf(marker)
  if (index < 0) throw new Error('无法识别的 source 路径: ' + sourcePath)
  return normalized.slice(index + marker.length)
}

function restore(map) {
  map.sources.forEach((sourcePath, i) => {
    const relative = sourceToRelative(sourcePath)
    const destination = path.join(root, 'src', relative)
    const content = (map.sourcesContent && map.sourcesContent[i]) || ''
    fs.mkdirSync(path.dirname(destination), { recursive: true })
    if (fs.existsSync(destination) && !force) {
      console.log('跳过（已存在）  ' + relative)
      return
    }
    fs.writeFileSync(destination, content.replace(/\r\n/g, '\n'), 'utf8')
    console.log('恢复  ' + relative)
  })
}

const mainMap = JSON.parse(
  fs.readFileSync(path.join(root, 'dist/main/index.cjs.map'), 'utf8')
)
const preloadBundle = fs.readFileSync(path.join(root, 'dist/preload/index.cjs'), 'utf8')
const match = preloadBundle.match(/base64,([A-Za-z0-9+/=]+)/)
if (!match) throw new Error('preload 产物中没有找到内联 sourcemap')
const preloadMap = JSON.parse(Buffer.from(match[1], 'base64').toString('utf8'))

console.log('== 主进程源码 ==')
restore(mainMap)
console.log('== preload 源码 ==')
restore(preloadMap)
console.log(force ? '完成（强制覆盖模式）' : '完成（已存在文件保留）')
