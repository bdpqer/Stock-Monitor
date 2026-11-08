/**
 * 用 esbuild 从 src/ 重新生成 Electron 主进程与 preload 产物。
 *
 * 原始仓库只提交了 dist/，产物是 electron-vite 生成的 CJS bundle。
 * 这里保持同样的「CJS + 依赖全部 external」策略，因此输出可以直接
 * 被 package.json 的 main 字段加载，也能被 electron-builder 原样打包。
 *
 *   node scripts/build-main.mjs     # 重新生成 dist/main/index.cjs 与 dist/preload/index.cjs
 */
import { build } from 'esbuild'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const common = {
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node18',
  packages: 'external',
  logLevel: 'info',
}

console.log('== 构建主进程 ==')
await build({
  ...common,
  entryPoints: [path.join(root, 'src/main/index.ts')],
  outfile: path.join(root, 'dist/main/index.cjs'),
  sourcemap: true,
})

console.log('== 构建 preload ==')
await build({
  ...common,
  entryPoints: [path.join(root, 'src/preload/index.ts')],
  outfile: path.join(root, 'dist/preload/index.cjs'),
  sourcemap: 'inline',
})

console.log('完成。渲染层为冻结产物，如需重新注入补丁请运行 build:renderer。')
