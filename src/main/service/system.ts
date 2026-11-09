/**
 * 系统工具服务（与操作系统、升级安装相关的通用能力）
 *
 * 主要由主进程的升级流程与 IPC 处理器调用：
 * - biggerVersion：比较两个点分版本号大小，用于判断是否有新版本可升。
 * - isWindows7：判断当前是否为 Windows 7 及更低版本（决定兼容分支/安装方式）。
 * - unzipInstallFile：解压下载的安装包并落盘，返回可执行文件信息。
 * - showAutoInstall：弹出「新版本下载完成」对话框，处理用户的安装/暂缓/跳过选择。
 * - isFileExist / getStat：文件存在性判断的辅助方法。
 */
import JSZip from "jszip"
import fs from "fs"
import pathmodule from "path"
import logger from "./logger";
import { shell, dialog } from 'electron'
import local_store from "../storage/local_store";

export default {
    /**
     * 比较两个点分版本号（如 "1.2.3"）的大小。
     * @param first 第一个版本号字符串
     * @param sec   第二个版本号字符串
     * @returns first > sec 时返回 true，否则返回 false
     * 说明：逐段比较，前段相等则继续比下一段；所有段都相等时返回 true（视为不更旧）。
     */
    biggerVersion(first:string,sec:string):boolean{
        let vs1 = first.split(".");  // 按 "." 拆成数组（如 ["1","2","3"]）
        let vs2 = sec.split(".");
        for(let i in vs1){  // 以 first 的段数为基准逐段比较
            let a = parseInt(vs1[i]);  // 转整数比较，避免字符串比较（如 "10" < "9"）出错
            let b = parseInt(vs2[i]);
            if(a>b){
                return true;
            }else if(a==b){  // 本段相等，继续比较下一段
                continue;
            }else{
                return false;
            }
        }

        return true;  // 所有段都相等，返回 true
    },

    /**
     * 判断是否为 Windows 7 及更低版本。
     * 依据：Win7 内核版本号为 6.1，此处用「主版本<=6 且次版本<=1」近似判断。
     * @returns 是 Win7 及以下返回 true；非 Windows 平台或更高版本返回 false
     */
    isWindows7(){
        if(process.platform=="win32"){  // 仅 Windows 平台需要该判断，其它平台直接返回 false
            let sysVer = process.getSystemVersion();  // 形如 "6.1.7601"
            let first_num = parseInt(sysVer.split(".")[0])  // 主版本号
            let sec_num = parseInt(sysVer.split(".")[1])  // 次版本号
            if(first_num<=6&&sec_num<=1){  // 主版本<=6 且次版本<=1 视为 Win7 及以下
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    },

    /**
     * 解压安装包（zip）并落盘。
     * 读取整个 zip 字节 → 用 JSZip 解出条目 → 把每个条目写到安装包所在目录，
     * 输出文件名用「zip 内条目名替换原包文件名」得到。
     * @param path 安装包（zip）的完整路径
     * @returns { name, path }：安装包文件名与最后写出的文件路径（循环中被最后一个条目覆盖）
     */
    async unzipInstallFile(path:string){
        let fdata = fs.readFileSync(path);  // 同步读取 zip 文件字节
        let jz = await JSZip.loadAsync(fdata);  // 解析 zip 结构
        let insFilePath = null;  // 解压输出路径
        let insFileName = null;  // 安装包文件名
        for(let k in jz.files){  // k 为 zip 内条目名；遍历每个条目
            let exe = jz.files[k];
            let u8 = await exe.async("uint8array");  // 取该条目的二进制内容
            let bname = pathmodule.basename(path);  // 安装包文件名（如 app.zip）
            insFilePath = path.replace(bname,k);  // 用条目名替换包名，得到输出路径
            insFileName = bname;
            fs.writeFileSync(insFilePath,u8);  // 写入解压后的文件

            logger.log("unzip file ok.");
        }

        return {name:insFileName,path:insFilePath};
    },

    /**
     * 弹出「新版本下载完成」对话框，按用户选择处理后续动作。
     * @param exe 下载完成的安装包信息（含 name / note / path / version 等字段）
     * 按钮与处理逻辑（对应按钮数组下标）：
     *  - 马上安装(0)：用系统默认方式打开可执行文件
     *  - 以后安装(1)：把安装包写入 preparedInstall 暂存，待下次提示
     *  - 跳过此版本(2)：记录 skipInstall 为当前版本号，不再提示该版本
     */
    async showAutoInstall(exe:any){
        const options: any = {
            type: 'info',
            title: '新版本'+exe.name+'下载完成，是否马上安装？',
            message: exe.note,
            buttons: ['马上安装','以后安装', '跳过此版本']
          }
          let index = await dialog.showMessageBox(options)  // index.response 为点击按钮的下标

          if (index.response == 0) {  // 0=马上安装
            logger.log("will open:"+exe.path);
            let errs = await shell.openPath(exe.path);  // 调系统默认方式打开可执行文件
            logger.log(errs);
          }else if(index.response == 1){  // 1=以后安装：暂存到 preparedInstall
            local_store.applyWith({
                preparedInstall:exe
              })
          }else{  // 2=跳过此版本：记录 skipInstall 版本号
            local_store.applyWith({
                skipInstall:exe.version
              })
          }
    },

    /**
     * 判断文件是否存在且为普通文件（而非目录）。
     * @param filePath 文件路径
     * @returns 存在且为普通文件返回 true，否则返回 false
     */
    async isFileExist(filePath:any):Promise<boolean>{
        let isExists:fs.Stats|null = await this.getStat(filePath);
        if(isExists==null){  // getStat 返回 null 表示出错/不存在
            return false;
        }else{
            return isExists.isFile();  // Stats.isFile() 区分文件与目录
        }
    },

    /**
     * 获取文件/目录的 stat 信息；出错（如不存在）时返回 null 而不是抛错，方便调用方直接判断。
     * @param filePath 文件路径
     * @returns Promise<fs.Stats | null>：成功返回 stats，失败返回 null
     */
    getStat(filePath:any) :Promise<fs.Stats|null> {
        return new Promise((resolve, reject) => {
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    resolve(null)  // 出错按 null 处理，避免调用方 try/catch
                } else {
                    resolve(stats);
                }
            })
        })
    },
}