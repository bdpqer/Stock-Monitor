import JSZip from "jszip"
import fs from "fs"
import pathmodule from "path"
import logger from "./logger";
import { shell, dialog } from 'electron'
import local_store from "../storage/local_store";

export default {
    biggerVersion(first:string,sec:string):boolean{
        let vs1 = first.split(".");
        let vs2 = sec.split(".");
        for(let i in vs1){
            let a = parseInt(vs1[i]);
            let b = parseInt(vs2[i]);
            if(a>b){
                return true;
            }else if(a==b){
                continue;
            }else{
                return false;
            }
        }

        return true;
    },

    isWindows7(){
        if(process.platform=="win32"){
            let sysVer = process.getSystemVersion();
            let first_num = parseInt(sysVer.split(".")[0])
            let sec_num = parseInt(sysVer.split(".")[1])
            if(first_num<=6&&sec_num<=1){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    },

    async unzipInstallFile(path:string){
        let fdata = fs.readFileSync(path);
        let jz = await JSZip.loadAsync(fdata);
        let insFilePath = null;
        let insFileName = null;
        for(let k in jz.files){
            let exe = jz.files[k];
            let u8 = await exe.async("uint8array");
            let bname = pathmodule.basename(path);
            insFilePath = path.replace(bname,k);
            insFileName = bname;
            fs.writeFileSync(insFilePath,u8);

            logger.log("unzip file ok.");
        }

        return {name:insFileName,path:insFilePath};
    },

    async showAutoInstall(exe:any){
        const options: any = {
            type: 'info',
            title: '新版本'+exe.name+'下载完成，是否马上安装？',
            message: exe.note,
            buttons: ['马上安装','以后安装', '跳过此版本']
          }
          let index = await dialog.showMessageBox(options)
          
          if (index.response == 0) {
            logger.log("will open:"+exe.path);
            let errs = await shell.openPath(exe.path);
            logger.log(errs);
          }else if(index.response == 1){
            local_store.applyWith({
                preparedInstall:exe
              })
          }else{
            local_store.applyWith({
                skipInstall:exe.version
              })
          }
    },

    async isFileExist(filePath:any):Promise<boolean>{
        let isExists:fs.Stats|null = await this.getStat(filePath);
        if(isExists==null){
            return false;
        }else{
            return isExists.isFile();
        }
    },

    getStat(filePath:any) :Promise<fs.Stats|null> {
        return new Promise((resolve, reject) => {
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    resolve(null)
                } else {
                    resolve(stats);
                }
            })
        })
    },
}