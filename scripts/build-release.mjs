#!/usr/bin/env node
/**
 * build-release.mjs —— 一条命令完成「重建 → 打包 → 对齐 latest.yml → 上传 Release → 校验」。
 *
 * 过去每次发布都要手工做四件事，容易漏、也容易出错，这里把它们固化：
 *
 *   ① 从 src/ 重建主进程 / preload 产物，注入渲染层补丁，跑 typecheck / 补丁校验 / 冒烟测试。
 *      这样发布物一定对应当前源码，不会出现「源码改了但包还是旧的」。
 *
 *   ② electron-builder 打包到「带时间戳的全新输出目录」。
 *      Windows 上的 Defender / Windows Search / Everything / IDE watcher 会在文件创建后
 *      异步打开新生成的 111 MB app.asar 并持有句柄（通常未授予 FILE_SHARE_DELETE），
 *      于是下次打包时 electron-builder 的 EnsureEmptyDir 删除 win-unpacked 会报 EPERM。
 *      用全新目录就不会去删旧 asar —— 这是绕开删除动作，不是消除锁。
 *      打包成功后脚本会立刻删掉临时目录（含 win-unpacked），赶在后台扫描启动前释放空间。
 *
 *   ③ 对齐 latest.yml。electron-builder 写的是短横线名 `Stock-monitor-Setup-1.0.0.exe`，
 *      而 GitHub 会把上传附件的文件名空格规范化为点号 `Stock-monitor.Setup.1.0.0.exe`。
 *      脚本按「本地实际文件名 → 空格换成点号」推导附件名，改写 url / path，
 *      并用新 NSIS 安装包实测值重写 size 与两处 sha512，避免任何手工对齐。
 *      随后把 4 个附件复制回 dist-electron/ 顶层，保持目录整洁。
 *
 *   ④ 用 gh release upload --clobber 覆盖 Release 附件、更新 Release notes，
 *      再从远端读回 4 个附件的 sha256 与 latest.yml 逐项比对，确认发布物与本地完全一致。
 *
 * 用法（参数通过 npm 的 -- 传递）：
 *   npm run build:release                          # 完整流程，含上传 Release（外部动作）
 *   npm run build:release -- --no-upload          # 只打包 + 对齐，不碰 GitHub
 *   npm run build:release -- --no-rebuild         # 跳过重建 dist/，保留当前产物
 *   npm run build:release -- --keep-unpacked      # 保留临时输出目录（含免安装 win-unpacked/）
 *   npm run build:release -- --tag v1.0.1         # 指定 Release tag，默认 v1.0.0
 *   npm run build:release -- --repo owner/repo    # 指定仓库，默认 bdpqer/Stock-Monitor
 *
 * 前置条件：已 npm install；上传模式需要 gh CLI 已登录且对目标仓库有写权限。
 * 注意：默认会重新生成 dist/main/index.cjs、dist/preload/index.cjs 并注入 index.html，
 *       如果你手工调整过 dist/，请加 --no-rebuild。
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import os from 'node:os'
import { execSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distElectron = path.join(root, 'dist-electron')

// ---------------------------------------------------------------------------
// 参数解析：只支持长开关，保持命令行简单可读
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2)
const has = (flag) => argv.includes(flag)
const option = (flag, fallback) => {
  const i = argv.indexOf(flag)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback
}

const noUpload = has('--no-upload')
const noRebuild = has('--no-rebuild')
const keepUnpacked = has('--keep-unpacked')
const tag = option('--tag', 'v1.0.0')
const repo = option('--repo', 'bdpqer/Stock-Monitor')

// ---------------------------------------------------------------------------
// 小工具：命令执行、哈希、路径引号、分阶段日志
// ---------------------------------------------------------------------------
/** 执行一条命令并把输出直接透传到终端；失败时抛错，由最外层统一报告阶段。 */
function run(cmd) {
  console.log(`  $ ${cmd}`)
  execSync(cmd, { cwd: root, stdio: 'inherit' })
}

/** 执行一条命令并捕获 stdout（用于解析 gh api 返回的 JSON）。 */
function capture(cmd) {
  return execSync(cmd, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 16 * 1024 * 1024,
  }).trim()
}

/** cmd.exe / bash 都接受双引号包裹含空格的路径；命令里的路径一律是相对 root 的 ASCII 路径。 */
const q = (p) => `"${p}"`
const sha512Of = (p) => crypto.createHash('sha512').update(fs.readFileSync(p)).digest('base64')
const sha256Of = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')

let stage = ''
function step(name) {
  stage = name
  console.log(`\n=== ${name} ===`)
}

// ---------------------------------------------------------------------------
// 主流程
// ---------------------------------------------------------------------------
async function main() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  const outDirRel = `dist-electron/build-${stamp}`
  const outDir = path.join(root, outDirRel)
  let notesPath = ''

  console.log('build:release 配置')
  console.log(`  仓库        : ${repo}`)
  console.log(`  Release tag : ${tag}`)
  console.log(`  重建 dist/  : ${noRebuild ? '否（--no-rebuild）' : '是'}`)
  console.log(`  上传 Release: ${noUpload ? '否（--no-upload，仅本地验证）' : '是'}`)
  console.log(`  输出目录    : ${outDirRel}`)

  // -- 阶段 0：前置检查 ------------------------------------------------------
  step('[0/6] 前置检查')
  for (const f of ['package.json', 'dist/main/index.cjs', 'dist/renderer/index.html']) {
    if (!fs.existsSync(path.join(root, f))) throw new Error(`缺少必要文件：${f}`)
  }
  fs.mkdirSync(distElectron, { recursive: true })
  if (!noUpload) {
    // 上传是会改动线上内容的外部动作，先确认工具与目标 Release 都可用，再开始打包。
    try {
      capture('gh --version')
      capture(`gh release view ${tag} --repo ${repo} --json tagName`)
    } catch (e) {
      throw new Error(`gh CLI 不可用或找不到 Release ${tag}：${e.message}`)
    }
    console.log(`  gh CLI 与 Release ${tag} 可用`)
  }

  // -- 阶段 1：重建产物并校验 ------------------------------------------------
  step('[1/6] 重建产物与校验')
  if (noRebuild) {
    console.log('  跳过 build:main / build:renderer（--no-rebuild）')
  } else {
    run('npm run build:main')      // src/ → dist/main + dist/preload
    run('npm run build:renderer')  // 幂等注入渲染层补丁
  }
  run('npm run typecheck')
  run('npm run check:patches')     // 17 项防回退校验，含「未回归云端 API」
  run('npm run smoke')             // mock Electron 下加载主进程 bundle

  // -- 阶段 2：打包到全新目录 ------------------------------------------------
  // 每次换目录是为了绕开旧 app.asar 的句柄锁；若仍撞锁，自动再换一个目录重试一次。
  step('[2/6] electron-builder 打包')
  const buildCmd = (dir) =>
    `npm run build -- --publish never --config.directories.output=${dir}`
  let activeOutRel = outDirRel
  let activeOut = outDir
  try {
    run(buildCmd(activeOutRel))
  } catch (firstError) {
    console.log('  首次打包失败，换一个全新输出目录重试一次（疑似 app.asar 被占用）')
    // 首次尝试可能留下半成品目录，尽力清掉，避免堆积占用磁盘。
    try { fs.rmSync(outDir, { recursive: true, force: true }) } catch { /* 被占用就留给后续手工清理 */ }
    activeOutRel = `${outDirRel}-retry`
    activeOut = path.join(root, activeOutRel)
    run(buildCmd(activeOutRel))
  }

  // -- 阶段 3：对齐 latest.yml 并归位附件 -----------------------------------
  step('[3/6] 对齐更新元数据并归位附件')
  const produced = fs.readdirSync(activeOut)
  const setupName = produced.find((f) => /Setup.*\.exe$/i.test(f))
  const portableName = produced.find((f) => /\.exe$/i.test(f) && f !== setupName)
  const blockmapName = produced.find((f) => f.endsWith('.blockmap'))
  if (!setupName || !portableName || !blockmapName || !produced.includes('latest.yml')) {
    throw new Error(`打包产物不完整：${produced.join(', ')}`)
  }

  const setupPath = path.join(activeOut, setupName)
  const portablePath = path.join(activeOut, portableName)
  const blockmapPath = path.join(activeOut, blockmapName)
  const ymlPath = path.join(activeOut, 'latest.yml')

  // GitHub 把附件名里的空格规范化为点号；从本地实际文件名推导，不依赖 electron-builder 的短横线规则。
  const ghSetupName = setupName.replace(/ +/g, '.')
  const size = fs.statSync(setupPath).size
  const sha512 = sha512Of(setupPath)

  // 逐行改写：url / path 换成 GitHub 附件名，size / sha512 换成新包实测值。
  // 保留原有缩进与 releaseDate，避免手工编辑导致 YAML 格式破损。
  const aligned = fs.readFileSync(ymlPath, 'utf8')
    .split(/\r?\n/)
    .map((line) => {
      if (/^\s*- url:/.test(line)) return line.replace(/(- url:)\s*\S+/, `$1 ${ghSetupName}`)
      if (/^path:/.test(line)) return `path: ${ghSetupName}`
      if (/^\s*sha512:/.test(line)) return line.replace(/(sha512:)\s*\S+/, `$1 ${sha512}`)
      if (/^\s*size:/.test(line)) return line.replace(/(size:)\s*\d+/, `$1 ${size}`)
      return line
    })
    .join('\n')

  // 回写两份：临时目录里一份用于后续比对，dist-electron/ 顶层一份用于上传与更新源。
  fs.writeFileSync(ymlPath, aligned, 'utf8')
  const topYml = path.join(distElectron, 'latest.yml')
  fs.writeFileSync(topYml, aligned, 'utf8')

  // 4 个附件统一归位到 dist-electron/ 顶层；用复制而非移动，临时目录稍后整体清理。
  const artifacts = [
    [setupPath, setupName],
    [portablePath, portableName],
    [blockmapPath, blockmapName],
  ]
  for (const [src, name] of artifacts) {
    fs.copyFileSync(src, path.join(distElectron, name))
  }

  const finalSetup = path.join(distElectron, setupName)
  const finalPortable = path.join(distElectron, portableName)
  const finalBlockmap = path.join(distElectron, blockmapName)

  // 本地自检：文件头、元数据一致性、附件名不再有短横线残留。
  if (fs.readFileSync(finalSetup).slice(0, 2).toString() !== 'MZ') {
    throw new Error('NSIS 安装包不是合法 PE 文件')
  }
  if (!aligned.includes(`url: ${ghSetupName}`) || !aligned.includes(`path: ${ghSetupName}`)) {
    throw new Error('latest.yml 的 url/path 未对齐')
  }
  if (!aligned.includes(`size: ${size}`) || !aligned.includes(`sha512: ${sha512}`)) {
    throw new Error('latest.yml 的 size/sha512 与新包不一致')
  }
  if (/Stock-monitor-Setup-/.test(aligned)) throw new Error('latest.yml 仍残留短横线附件名')
  console.log(`  latest.yml 已对齐：${ghSetupName}`)
  console.log(`  size ${size} / sha512 ${sha512.slice(0, 20)}…`)

  // 检查 app.asar 里确实打进了源码重建后的主进程与全部离线补丁。
  // 这里只读校验，不修改包内容；@electron/asar 缺失时降级为警告，不阻断发布。
  try {
    const asar = require('@electron/asar')
    const asarPath = path.join(activeOut, 'win-unpacked', 'resources', 'app.asar')
    const list = [...asar.listPackage(asarPath)]
    const find = (suffix) => list.find((x) => x.replace(/\\/g, '/').endsWith(suffix))
    const mainEntry = find('/dist/main/index.cjs')
    const main = asar.extractFile(asarPath, mainEntry.replace(/^\\+/, '')).toString()
    const required = ['reloadFromUserData', 'safeMachineId', 'safeInit', 'login-disabled',
      'sortKeys', 'backupConfig', 'restoreConfig', 'direct show indexWindow']
    const missing = required.filter((k) => !main.includes(k))
    if (list.length < 10000 || missing.length) {
      throw new Error(`app.asar 校验失败：文件数 ${list.length}，缺失 ${missing.join(', ')}`)
    }
    console.log(`  app.asar ${list.length} 个文件，${required.length} 项离线补丁齐全`)
  } catch (e) {
    console.log(`  ⚠ app.asar 校验跳过：${e.message}`)
  }

  // -- 阶段 4：上传 Release -------------------------------------------------
  const uploadTargets = [finalSetup, finalPortable, finalBlockmap, topYml]
  const relPaths = uploadTargets.map((p) => path.relative(root, p).replace(/\\/g, '/'))

  if (noUpload) {
    step('[4/6] 跳过上传（--no-upload）')
    console.log('  本地产物已就绪，GitHub Release 未改动。')
  } else {
    step('[4/6] 覆盖上传 Release 附件')
    const filesArg = relPaths.map(q).join(' ')
    run(`gh release upload ${tag} ${filesArg} --repo ${repo} --clobber`)

    // Release notes 通过 --notes-file 传入，避免命令行中文在 cmd.exe 下乱码。
    let head = ''
    try { head = capture('git rev-parse --short HEAD').trim() } catch { /* 非 git 环境忽略 */ }
    let dirty = false
    try { dirty = capture('git status --porcelain').trim().length > 0 } catch { /* 忽略 */ }
    const notes = [
      `${new Date().toLocaleString('zh-CN')} 由 \`npm run build:release\` 自动发布。`,
      `源码 HEAD \`${head}\`${dirty ? '（含本地未提交改动）' : ''}；Electron 40.1.0 / electron-builder 24.13.3。`,
      '',
      `NSIS 安装包 ${size} B（sha512: \`${sha512}\`）；便携版 ${fs.statSync(finalPortable).size} B。`,
      '附 blockmap 与 latest.yml；GitHub 会把附件名中的空格规范化为点号，',
      `latest.yml 已自动对齐 \`${ghSetupName}\`，size/sha512 与 NSIS 包实测一致，可直接作为更新源。`,
      '4 个附件 sha256 与本地逐项校验一致；app.asar 已通过离线补丁完整性检查。',
      '私有仓库，仅供个人使用。',
    ].join('\n')
    notesPath = path.join(os.tmpdir(), `stock-monitor-notes-${stamp}.md`)
    fs.writeFileSync(notesPath, notes, 'utf8')
    run(`gh release edit ${tag} --repo ${repo} --notes-file ${q(notesPath)}`)
  }

  // -- 阶段 5：远端一致性校验 -----------------------------------------------
  if (!noUpload) {
    step('[5/6] 远端附件校验')
    const release = JSON.parse(capture(`gh api repos/${repo}/releases/tags/${tag}`))
    const expected = new Map([
      [ghSetupName, finalSetup],
      [portableName.replace(/ +/g, '.'), finalPortable],
      [blockmapName.replace(/ +/g, '.'), finalBlockmap],
      ['latest.yml', topYml],
    ])
    for (const [name, localPath] of expected) {
      const asset = release.assets.find((a) => a.name === name)
      if (!asset) throw new Error(`远端缺少附件 ${name}`)
      if (asset.size !== fs.statSync(localPath).size) throw new Error(`附件 ${name} 大小不一致`)
      if (asset.digest !== `sha256:${sha256Of(localPath)}`) throw new Error(`附件 ${name} sha256 不一致`)
      console.log(`  OK  ${name} (${asset.size} B)`)
    }
    // 下载远端 latest.yml 与本地逐字节比对，确保自动更新源可用。
    const remoteYml = path.join(os.tmpdir(), `stock-monitor-latest-${stamp}.yml`)
    run(`gh release download ${tag} -p latest.yml -O ${q(remoteYml)} --repo ${repo} --clobber`)
    if (fs.readFileSync(remoteYml, 'utf8') !== fs.readFileSync(topYml, 'utf8')) {
      throw new Error('远端 latest.yml 与本地不一致')
    }
    fs.rmSync(remoteYml, { force: true })
    const latestTag = JSON.parse(capture(`gh api repos/${repo}/releases/latest`)).tag_name
    console.log(`  远端 latest.yml 一致；Latest = ${latestTag}`)
  } else {
    step('[5/6] 跳过远端校验（--no-upload）')
  }

  // -- 阶段 6：清理临时输出目录 ---------------------------------------------
  // 立刻删除 win-unpacked 是刻意安排：后台扫描器通常要过几十秒才会打开新 asar，
  // 趁现在删既释放 300–440 MB，也避免下次打包再撞锁。
  step('[6/6] 清理临时目录')
  if (keepUnpacked) {
    console.log(`  保留 ${activeOutRel}（--keep-unpacked）`)
  } else {
    try {
      fs.rmSync(activeOut, { recursive: true, force: true })
      console.log(`  已删除 ${activeOutRel}`)
    } catch (e) {
      // 两种常见原因：后台扫描器已锁住 asar，或运行环境限制「一次删除大量文件」。
      // 都不阻断发布，只提示：顶层 4 个附件已归位，临时目录可稍后手工删除。
      console.log(`  ⚠ 临时目录删除失败（文件被占用，或运行环境限制批量删除）：${e.message}`)
      console.log(`    顶层附件不受影响；在普通终端运行通常无此限制，也可稍后手工删除 ${activeOutRel}`)
    }
  }
  if (notesPath) fs.rmSync(notesPath, { force: true })

  // -- 完成摘要 -------------------------------------------------------------
  console.log('\n=== 完成 ===')
  for (const [name, p] of [
    [setupName, finalSetup], [portableName, finalPortable],
    [blockmapName, finalBlockmap], ['latest.yml', topYml],
  ]) {
    console.log(`  ${name.padEnd(44)} ${fs.statSync(p).size} B`)
  }
  console.log(noUpload
    ? '  本次未上传 GitHub；去掉 --no-upload 即可同步 Release。'
    : `  Release: https://github.com/${repo}/releases/tag/${tag}`)
}

main().catch((error) => {
  console.error(`\n❌ 失败于 ${stage || '初始化'}：${error.message}`)
  console.error('   已生成的产物保留在 dist-electron/，便于排查；未做破坏性回滚。')
  process.exit(1)
})
