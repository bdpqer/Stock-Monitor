"use strict";
var u=require("electron"),ve=require("os"),te=require("path"),be=require("electron-log"),xe=require("jszip"),We=require("fs"),Fe=require("axios"),Ae=require("events"),De=require("moment"),Ee=require("https"),_e=require("iconv-lite"),Te=require("electron-dl");
function D(i){return i&&typeof i=="object"&&"default"in i?i:{default:i}}var V=D(te),L=D(be),he=D(xe),I=D(We),h=D(Fe),ge=D(Ae),N=D(De),ie=D(Ee),J=D(_e),Ie=D(Te);
u.BrowserWindow.prototype.loadWithRoute=function(i){this.loadURL("file://"+te.join(__dirname,"../renderer/index.html")+`#${i}`)};
const B=require("electron-json-storage"),{machineIdSync:Me}=require("node-machine-id"),Q=new ge.default;
class oe{constructor(){this.fontSize=14,this.column=[0,1,2,3,4,9],this.keys=[],this.opa=100,this.uuid=Me(!0),this.model="nm",this.bounds=null,this.alias={},this.themeMode="classic",this.token=null,this.nickName="",this.avatar=null,this.validTime=null,this.dueTo=null,this.NewUser=!0,this.InviteUserID=0,this.clickPromote=!1,this.InviteCode=null,this.cost={},this.countDownTimeSec=86400,this.backColor="rgba(255,255,255,255)",this.textColor="rgba(90,90,90,255)",this.hideSwitch=!0,this.dynamicConfig={},this.synUpdateTime=null,this.alertsKey={},this.shortCutsSwitch=!0,this.shortCuts={boss:"Alt+`",adds:"Ctrl+t",addo:"Ctrl+]",mino:"Ctrl+["},this.skipInstall="",this.preparedInstall={},this.profitMode="ap",this.chartBounds=null,this.proxySwitch=!1,this.alertInfos={},this.windowTransparent=!1,this.openAtLogin=!0,this.freqWhenHide=null,this.profiteTotal=!1,this.groups=[],this.groupsSwitch=!0,this.debugSwitch=!1,this.backColorNew="#FFFFFF",this.backAlpha=255,this.textColorNew="#000000",this.textAlpha=255,this.alwaysOnTop=!1}isVip(){return true}addStock(e){return this.keys.findIndex((s,n)=>s.code==e.code&&s.marketCode==e.marketCode)>=0?!1:(this.keys.push(e),!0)}setTopStock(e){let t=this.keys.findIndex((s,n)=>s.code==e.code&&s.marketCode==e.marketCode);
t>=0&&(this.keys.splice(t,1),this.keys.unshift(e))}removeStock(e){let t=this.keys.findIndex((s,n)=>s.code==e.code&&s.marketCode==e.marketCode);
t>=0&&this.keys.splice(t,1)}setAlias(e,t){this.alias[e]=t}setCost(e,t,s){let n=this.cost[e],o=new Date,a=o.getFullYear()+"-"+(o.getMonth()+1)+"-"+o.getDate();
n?(t!=null&&t!=null&&(n.price=t,n.date=a),s!=null&&s!=null&&(n.amount=s),this.cost[e]=n):this.cost[e]={price:t,amount:s,date:a}}setAlert(e,t){let s=this.alertInfos[e];
s||(s={}),t.v==""||t.v==!1?delete s[t.at]:s[t.at]=t.v,console.log(s),this.alertInfos[e]=s}applyWith(e){return Object.assign(this,e),this}save(){const e=E;
if(e){let t=[];
Object.keys(e).forEach(s=>{JSON.stringify(le[s])!=JSON.stringify(e[s])&&t.push(s)}),le=JSON.parse(JSON.stringify(e)),B.set("stock-monitor-config",E,function(s){s&&(d.log("save config err:"),d.log(s+""),d.log(s.stack))}),Q.emit("onConfig",E,t)}}}var pe;
let le=(pe=B.getSync("stock-monitor-config"))!=null?pe:{};
var E,r={getPath(){return B.getDataPath()},checkFirstLaunchAndQuickExit(){let i=B.getSync("firstLaunch");
if(i.time==null||i.time==null)return B.set("firstLaunch",{time:N.default().toDate()},null),!1;
{let t=N.default(i.time),s=N.default();
var e=N.default.duration(s.diff(t));
return e.asMinutes()<10}},restore(){this.applyWith(new oe)},editWith(i){let e=i(this.config);
return e!=!1&&this.config.save(),e},applyWith(i){this.editWith(e=>{e.applyWith(i)})},get isVip(){return this.config.isVip()},get alpha(){return this.config.opa*.95/100+.05},addStock(i){return this.editWith(e=>e.addStock(i))},removeStock(i){return this.editWith(e=>e.removeStock(i))},setTopStock(i){return this.editWith(e=>e.setTopStock(i))},setAlias(i,e){return this.editWith(t=>t.setAlias(i,e))},setCost(i,e,t){return this.editWith(s=>s.setCost(i,e,t))},setAlert(i,e){return this.editWith(t=>t.setAlert(i,e))},on(i,e){Q.on(i,e)},removeListener(i,e){Q.removeListener(i,e)},get config(){if(E==null){E=new oe();
try{
E.applyWith(B.getSync("stock-monitor-config"));
}catch(err){
d.log("load config error:"+err);
}
let i=E.shortCuts;
if(i.preg==null)i.preg="Alt+q";
if(i.nextg==null)i.nextg="Alt+w";
}return E}};
const Pe=require("form-data");
require("https-proxy-agent");
const F=h.default.create({baseURL:"https://gs.codeffect.top",timeout:3e3,httpsAgent:new ie.default.Agent({rejectUnauthorized:!1})});
let Be=()=>{let e=r.config.uuid,t=process.platform,s=process.getSystemVersion(),n=u.app.getVersion(),o="";
return["x32","arm","mips","ia32",""].includes(process.arch)?o="32bit":["x64","arm64","ppc64"].includes(process.arch)&&(o="64bit"),{from:t,deviceid:e,os:t,osv:s,appv:n,osa:o}};
F.interceptors.request.use(function(i){return i.params=Object.assign(i.params,Be()),i},function(i){return Promise.reject(i)});
var C={// 注释掉用户服务功能
async loginWithWechat(i){return Promise.reject("login-disabled")},
async statisticPoke(i,e){return null},
async uploadFile(i){return null},
async sendAdvice(i){return null},
async sendException(i){console.log("sendException:"+i);return null},
async getConfig(i){return null},
async syncData(i){return null},async getGoodsInfo(){return []},
async getPayURL(i){return null},
async getPayStatus(i){return null},
async getUserInfo(){return null},
async fillInviteCode(i){return null},
async getVipDetail(){return null},
async testProxy(i,e){return null}};
L.default.transports.file.maxSize=1002430;
L.default.transports.file.format="[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}";
let G=new Date,qe=G.getFullYear()+"-"+(G.getMonth()+1)+"-"+G.getDate();
L.default.transports.file.fileName=qe+".log";
console.log("logger Path:"+L.default.transports.file.getFile().path);
// 注释掉日志与统计功能
var d={logDebug(i){r.config.debugSwitch&&this.log(i)},
log(i){(typeof i==typeof{}||typeof i==typeof[])&&(i=JSON.stringify(i)),console.log("[Logger]",i)},
openLogDir(){return null},
getLogPath(){return null},
async compressAndSend(){return null}},
Le={from:""},
W={poke(i,e){/* 统计功能已禁用 */}};
const j=class{constructor(){this.winName=null,this.didShowCallBack=null,this.win=null}static addWinMap(i,e){this.winMap[i]=e}static isOpened(i){return!!this.winMap[i]}setWinName(i){this.winName=i}getWinName(){return this.winName}showOnScreen(){var i,e;
d.log("showOnScreen"),(i=this.win)==null||i.setOpacity(0),(e=this.win)==null||e.show(),setTimeout(()=>{var t;
(t=this.win)==null||t.setOpacity(r.alpha)},1e3/50),this.didShowCallBack&&this.didShowCallBack()}hideFromScreen(){var i;
d.log("hideFromScreen"),(i=this.win)==null||i.hide()}isShow(){var i;
return(i=this.win)==null?void 0:i.isVisible()}setPosition(i,e){var n,o,a,l,c;
let t=(n=this.win)==null?void 0:n.getBounds(),s=u.screen.getDisplayMatching(t).scaleFactor;
if(s!==1&&s!==2&&s!==3){t.x=i,t.y=e,(o=this.win)==null||o.setBounds(t);
let f=(a=this.win)==null?void 0:a.getBounds(),w=f.width-t.width,g=f.height-t.height;
w<=2&&g<=2&&w>=0&&g>=0&&(t.width-=w,t.height-=g,(l=this.win)==null||l.setBounds(t,!0))}else(c=this.win)==null||c.setPosition(Math.floor(i),Math.floor(e),!0)}show(i=null){this.createWindow(i),W.poke("WindowShow",{name:this.winName})}createWindow(i){var t,s,n,o,a;
if(!this.win){var e={useContentSize:!0,show:!1,resizable:!1,parent:i,movable:!0,minimizable:!1,maximizable:!1,webPreferences:{preload:te.join(__dirname,"../preload/index.cjs"),nodeIntegration:!0,contextIsolation:!1,devTools:!0}};
u.Menu.setApplicationMenu(null),this.configWindow(e),this.win=new u.BrowserWindow(e),this.onWindowCreated(this.win),(t=this.win)==null||t.once("ready-to-show",()=>{var l;
(l=this.win)==null||l.show(),this.onWindowShown()}),(s=this.win)==null||s.on("move",()=>{var l;
this.onWindowBoundsChanged((l=this.win)==null?void 0:l.getBounds())}),(n=this.win)==null||n.on("blur",()=>{this.onWindowBlur()}),(o=this.win)==null||o.on("resize",()=>{var l;
this.onWindowBoundsChanged((l=this.win)==null?void 0:l.getBounds())}),(a=this.win)==null||a.on("close",l=>{let c=Object.values(j.winMap).findIndex(f=>f==this);
c>=0&&(j.winMap[Object.keys(j.winMap)[c]]=null),this.onWindowClosed(this.win),this.win=null})}}onWindowBoundsChanged(i){}configWindow(i){}onWindowShown(){var i;
u.app.isPackaged||(i=this.win)==null||i.webContents.openDevTools({mode:"detach"})}onWindowClosed(i){W.poke("WindowClose",{name:this.winName})}onWindowBlur(){}};
let v=j;
v.winMap={};
class Ue extends v{configWindow(e){e.width=680,e.height=371,e.frame=!1}onWindowCreated(e){e.loadWithRoute("/addstock")}}var T={async addStock(i,e){let t=await this.listUserSug();
    // 先添加股票到配置
    let result = r.isVip||t.length<1?r.editWith(s=>s.addStock(e))?1:3:2;
    if(result == 1) { // 添加成功后立即触发窗口刷新
      // 不调用可能导致界面重渲染的函数
      // 直接通过底层机制更新股票数据和界面
      
      // 关键：在添加股票后立即获取新股票的数据
      setTimeout(async () => {
        // 立即获取新增的股票数据
        const stocks = await A.getStocks([e], !1);
        if(stocks) {
          Object.assign(_, stocks); // 将新获取的股票数据合并到缓存中
        }
        
        // 再次获取新浪股票数据
        const sinaStocks = await A.getSinaStocks([e]);
        if(sinaStocks) {
          Object.assign(_, sinaStocks); // 将新获取的新浪股票数据合并到缓存中
        }
        
        // 确保发送最新的股票数据，无论S是否存在
        setTimeout(async () => {
          const latestStocks = await T.listUserSug();
          const stockData = [];
          latestStocks.forEach(stock => {
            stockData.push({sug: stock, stock: _[stock.key] || null});
          });
          
          // 发送给当前连接的webContents
          if(S) {
            S.send("stock-update", {data: stockData});
          }
          
          // 同时也尝试通过主窗口发送（如果存在）
          if(m && m.win && m.win.webContents) {
            m.win.webContents.send("stock-update", {data: stockData});
          }
        }, 100); // 延时确保数据获取完成
      }, 50); // 短暂延时确保配置已保存
    }
    return result;
},async removeStock(i,e){return r.removeStock(e),!0},async setTopStock(i,e){r.setTopStock(e)},async listUserSug(){return r.config.keys},getStock(i){return b.getStockData(i)},onEvent(i,e){b.onEvent(i,e)},removeEvent(i,e){b.removeEvent(i,e)},forStockUpdate(){b.forceUpdate()}},ae=require("https-proxy-agent");
h.default.defaults.timeout=3e3;
h.default.defaults.httpsAgent=new ie.default.Agent({rejectUnauthorized:!1});
var x=new Map;
x.set("sh","A\u80A1");
x.set("jj","\u57FA\u91D1");
x.set("sz","A\u80A1");
x.set("hk","\u6E2F\u80A1");
x.set("us","\u7F8E\u80A1");
x.set("qh","\u671F\u8D27");
x.set("gzqh","\u80A1\u6307\u671F\u8D27");
x.set("nq","\u4E09\u677F");
x.set("zz","\u8F6C\u503A");
x.set("wh","\u5916\u6C47");
x.set("bj","A\u80A1");
class U{constructor(e,t){this.code=e,this.marketCode=t,this.key=this.marketCode+this.code}}class we{}function Oe(i,e){var t=new we;
let s=i.split('="'),n=s[0].split("hq_str_")[1],o=s[1],l=o.substring(0,o.length-2).split(",");
return t.key=n,t.code=e.code,t.name=l[0],e.marketCode=="zz"?(t.price=parseFloat(l[3]),t.open=parseFloat(l[1]),t.preClose=parseFloat(l[2]),t.per=(t.price-t.preClose)/t.preClose,t.volume=parseFloat(l[8]),t.amount=parseFloat(l[9]),t.timeStr=l[30]):e.marketCode=="qh"?(t.price=parseFloat(l[8]),t.open=parseFloat(l[2]),t.preClose=parseFloat(l[10]),t.per=(t.price-t.preClose)/t.preClose,t.volume=parseFloat(l[14]),t.timeStr=l[17]):e.marketCode=="gzqh"?(t.name=l[l.length-1],t.price=parseFloat(l[3]),t.open=parseFloat(l[0]),t.preClose=parseFloat(l[14]),t.per=(t.price-t.preClose)/t.preClose,t.volume=parseFloat(l[4]),t.timeStr=l[36]):e.marketCode=="wh"&&(t.name=l[9],t.price=parseFloat(l[1]),t.open=parseFloat(l[5]),t.preClose=parseFloat(l[3]),t.per=(t.price-t.preClose)/t.preClose,t.dayMax=parseFloat(l[6]),t.dayMin=parseFloat(l[7]),t.timeStr=l[17]),t}function Ne(i,e){var o;
var t=new we,s=i.split('="');
e.marketCode=="hk"?t.key=e.key:t.key=s[0].substring(2),t.code=t.key;
let n=s[1].split("~");
return(o=t.key)!=null&&o.startsWith("jj")?(t.name=n[1],t.price=parseFloat(n[2]),t.preClose=parseFloat(n[5]),t.per=(t.price-t.preClose)/t.preClose):(t.name=n[1],t.price=parseFloat(n[3]),t.preClose=parseFloat(n[4]),t.open=parseFloat(n[5]),t.buy1Vo=parseFloat(n[10]),t.sell1Vo=parseFloat(n[20]),t.per=parseFloat(n[32])/100,t.dayMax=parseFloat(n[33]),t.dayMin=parseFloat(n[34]),t.volume=parseFloat(n[6])*100,t.amount=parseFloat(n[57])*1e4,t.swap=parseFloat(n[38])/100,n.length>74&&(t.abr=parseFloat(n[74])/100)),t.timeStr=n[30],t}function ze(i,e){let t={},s=[],o=JSON.parse(e.split("=")[1]).data[i].data,a=o.data,l=o.date;
for(let c in a){let w=a[c].split(" "),g={};
g.time=l+"T"+w[0]+"00",g.price=parseFloat(w[1]),s.push(g)}return t.points=s,t}function ke(i){let e=i[0],t=i[1],s=i[2],n=i[3],o=i[4],a=i[5],l={};
return l.max=parseFloat(n),l.min=parseFloat(o),l.date=e,l.open=parseFloat(t),l.close=parseFloat(s),l.vol=parseFloat(a),l}function je(i,e){let t={},s=[],n=JSON.parse(e.split("=")[1]);
if(n.code!=0)return null;
let o=n.data[i],a=o.qfqday;
a==null&&(a=o.day);
for(let l in a){let c=a[l],f=ke(c);
f.date=f.date.substring(5),s.push(f)}return t.points=s,t}function Ve(i,e,t){let s={},n=[],o=JSON.parse(e.split("=")[1]);
if(o.code!=0)return null;
let l=o.data[i][t];
for(let c in l){let f=l[c],w=ke(f),g=w.date.substring(4);
w.date=g.substring(0,4)+"-"+g.substring(4,6)+":"+g.substring(6,8),n.push(w)}return s.points=n,s}var A={async getStocks(i,e){var o,a;
let t=i;
i=[];
var s="https://web.sqt.gtimg.cn/q=";
for(let l in t){let c=t[l];
((o=c.extra)==null?void 0:o.startsWith("sina_"))&&c.extra!=="sina_bj"||(i.push(c),c.marketCode=="us"?s=s+c.marketCode+((a=c.code)==null?void 0:a.split(".")[0].toUpperCase())+",":c.marketCode=="hk"?s=s+"r_"+c.marketCode+c.code+",":s=s+c.marketCode+c.code+",")}s+="&_="+new Date().getTime();
try{let l=await h.default.get(s,{headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0;Win64;x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",Referer:"https://gu.qq.com/"},responseType:"arraybuffer",responseEncoding:"binary"}),c=J.default.decode(l.data,"gbk"),f={};
var n=c.split(";");
let w=0;
for(let g in n){let p=n[g].trim(),k=i.find(y=>{var ne;
let K=n[g].split("=")[0].replaceAll("v_","").trim(),M="";
return y.marketCode=="us"?M=y.marketCode+((ne=y.code)==null?void 0:ne.split(".")[0].toUpperCase()):y.marketCode=="hk"?M="r_"+y.marketCode+y.code:M=""+y.marketCode+y.code,M===K})||new U("","");
if(p.length>0){let y=Ne(p,k);
y.index=w,w++,y.code&&(k==null?void 0:k.key)?(y.key=k.key,y.marketCode=k.marketCode,y.extra=k.extra,f[y.key]=y):(d.log("get stock error:"),d.log("sug:"+JSON.stringify(k)),d.log("stock:"+JSON.stringify(y)))}}return f}catch(l){return d.log(l+""),null}},async getSugs(i){var e={v:2,q:i,t:"all"};
let t=await h.default.get("https://smartbox.gtimg.cn/s3/",{params:e,headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0;Win64;x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",Referer:"https://gu.qq.com/"}});
var s;
s=[];
var n=t.data;
n=n.substring(8,n.length-1);
var o=n.split("^");
if(o.length<1)return s;
for(let f in o){var a=o[f],l=new U("code","xx"),c=a.split("~");
if(c.length<2)continue;
let w=c[0];
l.marketCode=w,l.market=x.get(w),l.code=c[1],l.key=l.marketCode+l.code;
let g=c[2].match(/\\u([0-9A-Fa-f]{4})/g),p=c[2];
for(let k in g){let y=g[k],K=parseInt(y.substr(2),16),M=String.fromCharCode(K);
p=p.replace(y,M)}l.name=p,l.extra=c[4],s.push(l)}return s},async getSinaSugs(i){let e=new Date().getTime();
var t={type:"81,85,86,88,71,11",key:i,name:"suggestdata_"+e};
let s=await h.default.get("https://suggest3.sinajs.cn/suggest/",{params:t,headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0;Win64;x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",Referer:"https://finance.sina.com.cn/"},responseType:"arraybuffer",responseEncoding:"binary"}),n=J.default.decode(s.data,"gb18030");
var o;
o=[];
let a=n.split('="')[1],c=a.substring(0,a.length-2).split(";");
for(let w in c){let p=c[w].split(","),k=null,y=null;
if(p[1]=="81"&&p[4].endsWith("\u8F6C\u503A")?(k="zz",y=p[3]):p[1]=="87"||p[1]=="85"?(k="qh",y="nf_"+p[2].toUpperCase()):p[1]=="88"?(k="gzqh",y="nf_"+p[2].toUpperCase()):p[1]=="71"?(k="wh",y="fx_s"+p[2]):p[1]=="11"&&p[3].startsWith("bj")?(k="bj",y="bj"+p[2].toUpperCase()):(console.log("not support market type."),console.log(p)),k!=null){var f=new U(p[2],k);
f.market=x.get(k),f.name=p[4],f.extra="sina_"+k,f.key=y,o.push(f)}}return o},async getSinaStocks(i){var n;
let e=new Date().getTime();
var t="https://hq.sinajs.cn/etag.php?_="+e+"&list=";
let s=[];
for(let o in i){let a=i[o];
(a.extra=="sina_zz"||a.extra=="sina_qh"||a.extra=="sina_gzqh"||a.extra=="sina_wh")&&(t+=a.key+",",s.push(a))}if(s.length==0)return null;
try{let o=await h.default.get(t,{headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0;Win64;x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",Referer:"https://finance.sina.com.cn/"},responseType:"arraybuffer",responseEncoding:"binary"}),a=J.default.decode(o.data,"gb18030");
d.log("\u65B0\u6D6A:----------------"+JSON.stringify(a));
let l={},c=a.trim().split(";"),f=0;
for(let w in c){let g=c[w];
if(g.trim()=="")continue;
let p=s[f],k=Oe(g,p);
k.index=f,f++,k.code&&((n=p==null?void 0:p.key)==null?void 0:n.toLowerCase().indexOf(k.code.toLowerCase()))!=-1&&p!=null&&p.key&&(k.key=p.key,k.marketCode=p.marketCode,l[k.key]=k)}return l}catch(o){return d.log(o+""),null}},async getFenShiData(i){let e="https://web.ifzq.gtimg.cn/appstock/app/minute/query?_var=min_data_"+i+"&code="+i+"&r="+Math.random();
console.log(e);
let t=await h.default.get(e,{headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0;Win64;x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",Referer:"https://gu.qq.com/"}}),s=ze(i,t.data),n=r.config;
if(s.name=n.alias[i],s.name==null||s.name==null||s.name=="")for(let o in n.keys){let a=n.keys[o];
if(a.key==i){s.name=a.name;
break}}return s},async getDaykData(i){let e="https://proxy.finance.qq.com/ifzqgtimg/appstock/app/newfqkline/get?_var=kline_dayqfq&param="+i+",day,,,180,qfq&r="+Math.random();
console.log(e);
let t=await h.default.get(e,{headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0;Win64;x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",Referer:"https://gu.qq.com/"}});
return je(i,t.data)},async getMkData(i,e){let t="https://ifzq.gtimg.cn/appstock/app/kline/mkline?param="+i+","+e+",,180&_var="+e+"_today&r="+Math.random();
console.log(t);
let s=await h.default.get(t,{headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0;Win64;x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",Referer:"https://gu.qq.com/"}});
return Ve(i,s.data,e)},setProxy(i,e,t,s){if(t==null||t==null){let n=new ae("http://"+i+":"+e);
n.rejectUnauthorized=!1,h.default.defaults.httpsAgent=n}else{let n=new ae("http://"+t+":"+s+"@"+i+":"+e);
n.rejectUnauthorized=!1,h.default.defaults.httpsAgent=n}},cleanProxy(){h.default.defaults.httpsAgent=new ie.default.Agent({rejectUnauthorized:!1}),h.default.defaults.proxy=!1}};
const R=new ge.default;
var ye=!0,S,Z;
function me(){Z&&clearTimeout(Z)}function H(i=!1){if(d.logDebug("_scheduleNext:"+i),me(),i){re(!0);
return}let e=3200;
  d.logDebug("fetchTime:"+e),Z=setTimeout(re,e)}var q=null,_={};
function Re(i,e){let t={};
if(i!=null){for(let n in i){let o=i[n];
o.stock?t[o.stock.key]=o:(d.log("no stock found in v:"),d.log(o))}i=t}let s=r.config.alertInfos;
for(let n in e){let o=e[n].stock;
if(!o){d.log("cuStock not valid.");
continue}let a=o.key,l=s[a];
if(!!l){if(l.downalert_switch){let c=l.downalert_price,f=l.downalert_text,w=!1;
if(i==null&&c&&f&&o.price&&o.price<c)w=!0;
else if(i!=null&&i[a]&&c&&f&&o.price){let g=i[a].stock;
g&&g.price&&g.price>=c&&o.price<c&&(w=!0)}w&&R.emit("alertPrice",{text:f,key:o.key,at:"downalert_switch"})}if(l.upalert_switch){let c=l.upalert_price,f=l.upalert_text,w=!1;
if(i==null&&c&&f&&o.price&&o.price>c)w=!0;
else if(i!=null&&i[a]&&c&&f&&o.price){let g=i[a].stock;
g&&g.price&&g.price<=c&&o.price>c&&(w=!0)}w&&R.emit("alertPrice",{text:f,key:o.key,at:"upalert_switch"})}}}}function He(i){let e=new Date,t=e.getFullYear()+"-"+(e.getMonth()+1)+"-"+e.getDate();
for(let s in i){let n=i[s].stock;
if(!n){d.log("processData stock not valid:"),d.log(i[s]);
continue}let a=r.config.cost[n.key];
if(a&&a.amount>0?t==a.date&&a.price?(n.cost=a.price,n.dayProfite=(n.price-a.price)*a.amount):n.dayProfite=n.preClose*a.amount*n.per:n.dayProfite=0,a&&a.amount>0&&a.price>0){let l=(n.price-a.price)*a.amount,c=l/(a.price*a.amount);
n.totalPro=l,n.totalProPer=c,n.cost=a.price}else n.totalPro=0,n.totalProPer=0}}async function re(i=!1){d.logDebug("_updateStockInfo:"+i);
let e=[];
try{let t=await T.listUserSug();
if(t.length==0){S==null||S.send("stock-update",{data:[]});
  m&&m.win&&m.win.webContents&&m.win.webContents.send("stock-update",{data:[]});
  return}
if(i){let o=[];
t.forEach(a=>{a&&a.key&&o.push({sug:a,stock:_[a.key]})}),S==null||S.send("stock-update",{data:o});
  m&&m.win&&m.win.webContents&&m.win.webContents.send("stock-update",{data:o})}d.logDebug("getStocks:"+i);
let s=await A.getStocks(t,!1);
  d.logDebug("getSinaStocks:"+i);
  let n=await A.getSinaStocks(t);
if(d.logDebug("getSinaStocks done."+i),s!=null?_=Object.assign(_,s):d.log("update tencent stock data fail."),n!=null&&(_=Object.assign(_,n)),t.forEach(o=>{o&&o.key&&e.push({sug:o,stock:_[o.key]})}),e.length>0){let o=null;
q!=null&&(o=q.data),Re(o,e),He(e),q={data:e},
S==null||S.send("stock-update",{data:e}),
m&&m.win&&m.win.webContents&&m.win.webContents.send("stock-update",{data:e})}else d.log("stockData is empty.");
  d.logDebug("will _scheduleNext:"+S),S&&H(!1)}catch(t){d.log("stock-update-err:");
  let s="uncaughtException:"+t+"|||"+t.stack;
  d.log(s)}}u.ipcMain.on("fetch-stock",()=>{q!=null&&(S==null||S.send("stock-update",q),m&&m.win&&m.win.webContents&&m.win.webContents.send("stock-update",q))});
const Y=(i,e)=>{(e.indexOf("keys")>=0||e.indexOf("token")>=0)&&H(!0)};
var b={attachWebContents(i){S=i,r.removeListener("onConfig",Y),r.on("onConfig",Y),setTimeout(async ()=>{H(!0);},2000);
  // 附加时立即发送当前股票数据
  setTimeout(async () => {
    if(S) {
      const latestStocks = await T.listUserSug();
      const stockData = [];
      latestStocks.forEach(stock => {
        stockData.push({sug: stock, stock: _[stock.key] || null});
      });
      S.send("stock-update", {data: stockData});
    }
  }, 100); // 减少延时以加快显示
  // 立即触发一次数据更新
  setTimeout(() => {
    if(S) {
      T.forStockUpdate(); // 确保在webContents设置后立即触发数据更新
    }
  }, 150);
},detachWebContents(i){S===i&&(r.removeListener("onConfig",Y),S=null,me())},getStockData(i){return _[i]},onEvent(i,e){R.on(i,e)},removeEvent(i,e){R.removeListener(i,e)},forceUpdate(){H(!0)},setIndexWindowVisible(i){ye=i}};
const Ke=0,ue=1,ce=2,Je=3,Ge=4;
class Ye extends v{constructor(){super(...arguments),this.hideSwitch=!0,this.hideType=Ke,this.configListener=null}configWindow(e){e.alwaysOnTop=!0,e.center=!1,e.frame=!1,e.skipTaskbar=!0,e.backgroundColor="#00000000",e.thickFrame=!1,e.hasShadow=!1,r.config.windowTransparent?(e.transparent=!0,e.resizable=!1):(e.transparent=!1,e.resizable=!1);
let t=r.config.bounds;
if(t==null){let s=u.screen.getPrimaryDisplay().bounds,n=s.y+s.height-150;
t={x:s.x+s.width-250,y:n,width:250,height:150}}t&&(e.x=t.x,e.y=t.y,e.width=t.width,e.height=t.height)}onWindowCreated(e){b.attachWebContents(e.webContents);
var t=this;
this.configListener=(s,n)=>{t.handleConfigChanged(s,n)},r.on("onConfig",this.configListener),r.editWith(s=>{s.bounds=null}),process.platform=="win32"&&e.setAlwaysOnTop(r.config.alwaysOnTop,"normal"),e.setOpacity(r.alpha),e.webContents.on("did-finish-load",()=>{}),e.webContents.on("did-fail-load",(s,n,o,a,l)=>{d.log("Frontend page failed to load - errorCode:"+o+", errorDescription:"+a)}),e.webContents.on("dom-ready",()=>{}),e.webContents.on("render-process-gone",(s,n)=>{d.log("Frontend render process gone - reason:"+s+", exitCode:"+n)}),e.loadWithRoute("/")};
onWindowClosed(e){b.detachWebContents(e.webContents),this.configListener&&r.removeListener("onConfig",this.configListener)};onWindowBoundsChanged(e){}onWindowBlur(){}handleConfigChanged(e,t){var s,n,o;
(s=this.win)==null||s.setOpacity(r.alpha),(o=(n=this.win)==null?void 0:n.webContents)==null||o.send("app-config",e,t),t[0]=="hideSwitch"&&(e.hideSwitch==!1&&this.showIfOnScreenBorder(),this.hideSwitch=e.hideSwitch),t[0]=="alwaysOnTop"&&(this.win==null||this.win.setAlwaysOnTop(e.alwaysOnTop,"normal"))}getBounds(){var e;
return(e=this.win)==null?void 0:e.getBounds()}hideIfOnScreenBorder(){var n;
if(this.hideSwitch==!1)return;
let e=(n=this.win)==null?void 0:n.getBounds(),t=u.screen.getDisplayMatching(e).bounds;
if(!t){d.log("sb invalide.");
return}let s=5;
if(e&&e.x+e.width>=t.x+t.width){let o=t.x+t.width-s,a=e.y;
this.setPosition(Math.floor(o),Math.floor(a)),this.hideType=ue,b.setIndexWindowVisible(!1)}else if(e&&e.x<=t.x){let o=t.x+s-e.width,a=e.y;
this.setPosition(Math.floor(o),Math.floor(a)),this.hideType=ce,b.setIndexWindowVisible(!1)}}showIfOnScreenBorder(){var s;
if(this.hideSwitch==!1)return;
let e=(s=this.win)==null?void 0:s.getBounds();
if(!e){d.log("bounds invalide.");
return}let t=u.screen.getDisplayMatching(e).bounds;
if(this.hideType==ue){let n=t.x+t.width-e.width,o=e.y;
this.setPosition(Math.floor(n),Math.floor(o)),this.hideType=Je,b.setIndexWindowVisible(!0),b.forceUpdate()}else if(this.hideType==ce){let n=t.x,o=e.y;
this.setPosition(Math.floor(n),Math.floor(o)),this.hideType=Ge,b.setIndexWindowVisible(!0),b.forceUpdate()}}setToCenter(){var o;
let e=(o=this.win)==null?void 0:o.getBounds(),t=u.screen.getPrimaryDisplay().bounds,s=t.width/2-e.width/2,n=t.height/2-e.height/2;
s=Math.floor(s),n=Math.floor(n),this.setPosition(s,n)}showOnScreen(){super.showOnScreen(),b.setIndexWindowVisible(!0)}hideFromScreen(){super.hideFromScreen(),b.setIndexWindowVisible(!1)}}class Se extends v{configWindow(e){e.width=280,e.height=400,e.title="\u767B\u5F55"}onWindowCreated(e){e.loadWithRoute("/login"),u.ipcMain.removeHandler("login"),u.ipcMain.handle("login",async(t,s,n)=>{var o,a;
if(s==="device")return(o=this.onLoginFinish)==null||o.call(this,null),e.close(),e.destroy(),!0;
if(s==="wechat"){let l=await C.loginWithWechat(n);
  return r.applyWith({nickName:l.NickName,token:l.Token,avatar:l.Avatar,validTime:l.ValidTime,dueTo:l.DueTo,synUpdateTime:null,NewUser:l.NewUser,InviteUserID:l.InviteUserID,InviteCode:l.InviteCode}),(a=this.onLoginFinish)==null||a.call(this,l),e.close(),e.destroy(),!0}return!1})}onWindowClosed(){u.ipcMain.removeHandler("login")}}class de extends v{constructor(){super(...arguments),this.route="/setting",this.configListener=null}configWindow(e){e.width=700,e.height=600,e.title="\u8BBE\u7F6E"}setRoute(e){this.route=e}onWindowCreated(e){e.loadWithRoute(this.route);
var t=this;
this.configListener=(s,n)=>{t.handleConfigChanged(s,n)},r.on("onConfig",this.configListener)}handleConfigChanged(e,t){var s,n;
(n=(s=this.win)==null?void 0:s.webContents)==null||n.send("app-config",e,t)}}class $e extends v{configWindow(e){e.width=700,e.height=700,e.title="\u4F1A\u5458"}onWindowCreated(e){e.loadWithRoute("/vip")}}class Qe extends v{constructor(){super(...arguments),this.stockKey=null}configWindow(e){e.width=380,e.center=!1,e.height=460,e.title="\u66F4\u591A"}onWindowCreated(e){if(!this.stockKey){
  return}e.loadWithRoute("/cost?key="+this.stockKey)}setStock(e){this.stockKey=e}reload(){var e;
  (e=this.win)==null||e.webContents.send("reload",this.stockKey)}}var fe=!1;
function Ze(){if(!fe){fe=!0;
var i=-2;
u.session.defaultSession.webRequest.onBeforeRequest((e,t)=>{var s,n,o,a;
if(e.url.startsWith("https://gs.codeffect.top/user/login_wechat")){let c=new URL(e.url).searchParams.get("code");
(s=e.webContents)==null||s.send("wechat",2,c);
return}else e.url.startsWith("https://lp.open.weixin.qq.com/connect/l/qrconnect?uuid=")&&(e.url.indexOf("last=404")>0?(i=1,(n=e.webContents)==null||n.send("wechat",1,"\u626B\u7801\u6210\u529F")):e.url.indexOf("last=403")>0?i==1&&(i=-1,(o=e.webContents)==null||o.send("wechat",-1,"\u53D6\u6D88\u767B\u5F55")):i!=1&&(i=0,(a=e.webContents)==null||a.send("wechat",0,"")));
t({})})}}var P={biggerVersion(i,e){let t=i.split("."),s=e.split(".");
for(let n in t){let o=parseInt(t[n]),a=parseInt(s[n]);
if(o>a)return!0;
if(o==a)continue;
return!1}return!0},isWindows7(){if(process.platform=="win32"){let i=process.getSystemVersion(),e=parseInt(i.split(".")[0]),t=parseInt(i.split(".")[1]);
return e<=6&&t<=1}else return!1},async unzipInstallFile(i){let e=I.default.readFileSync(i),t=await he.default.loadAsync(e),s=null,n=null;
for(let o in t.files){let l=await t.files[o].async("uint8array"),c=V.default.basename(i);
  s=i.replace(c,o),n=c,I.default.writeFileSync(s,l)}return{name:n,path:s}},async showAutoInstall(i){const e={type:"info",title:"\u65B0\u7248\u672C"+i.name+"\u4E0B\u8F7D\u5B8C\u6210\uFF0C\u662F\u5426\u9A6C\u4E0A\u5B89\u88C5\uFF1F",message:i.note,buttons:["\u9A6C\u4E0A\u5B89\u88C5","\u4EE5\u540E\u5B89\u88C5","\u8DF3\u8FC7\u6B64\u7248\u672C"]};
let t=await u.dialog.showMessageBox(e);
if(t.response==0){let s=await u.shell.openPath(i.path);
  }else t.response==1?r.applyWith({preparedInstall:i}):r.applyWith({skipInstall:i.version})},async isFileExist(i){let e=await this.getStat(i);
return e==null?!1:e.isFile()},getStat(i){return new Promise((e,t)=>{I.default.stat(i,(s,n)=>{e(s?null:n)})})}};
class Xe extends v{configWindow(e){e.width=331,e.height=404,e.title=""}onWindowCreated(e){e.loadWithRoute("/invite")}}class et extends v{constructor(){super(...arguments),this.stockKey=null}configWindow(e){e.width=400,e.height=285,e.title="\u5206\u65F6",e.frame=!1;
let t=r;
if(e.opacity=t.alpha,r.config.chartBounds){let s=r.config.chartBounds;
e.x=s.x,e.y=s.y}}onWindowCreated(e){if(typeof this.stockKey=="object"){let t=Object.keys(this.stockKey).map(s=>`${s}=${this.stockKey[s]}`);
e.loadWithRoute("/chart?"+t.join("&"))}else e.loadWithRoute("/chart?key="+this.stockKey)}setStock(e){this.stockKey=e}reload(){var e;
  (e=this.win)==null||e.webContents.send("reload",this.stockKey)}}class tt extends v{configWindow(e){e.width=380,e.height=420,e.title="\u5E7D\u7075\u770B\u76D8"}onWindowCreated(e){e.loadWithRoute("/advice")}}const $={};
process.on("uncaughtException",function(i){let e="uncaughtException:"+i+"|||"+i.stack;
d.log(e),u.app.isPackaged&&C.sendException(e)});
// 注释掉自动更新功能
async function it(){/* 自动更新功能已禁用 */}function Ce(i){i!=null&&i.NewUser&&i.InviteUserID==0&&O(null,"invite",null)}async function X(){if(r.config.token==null||r.config.token=="")return;
// 注释掉配置同步 - 跳过从后端获取配置
/*
let i=await C.syncData(!1);
if(i==null)return;
let e=!1;
if(r.config.synUpdateTime==null)e=!0;
else if(i.UpdatedTime==""||!i.UpdatedTime)e=!0;
else{let t=new Date(r.config.synUpdateTime),s=new Date(i.UpdatedTime);
    s&&s>t&&(e=!0)}if(e){let t=JSON.parse(i.Data);
    r.applyWith(t)}
*/
return; // 直接返回，不执行同步操作
}ve.release().startsWith("6.1")&&u.app.disableHardwareAcceleration();
process.platform==="win32"&&u.app.setAppUserModelId(u.app.getName());
process.platform==="darwin"&&u.app.isPackaged&&u.app.dock.hide();
u.app.requestSingleInstanceLock()||(u.app.quit(),process.exit(0));
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS="true";
let m=new Ye;
m.hideSwitch=r.config.hideSwitch;
m.didShowCallBack=function(){T.forStockUpdate();};
u.app.whenReady().then(function(){B.setDataPath(u.app.getPath("userData"));let le=B.getSync("stock-monitor-config");E=new oe();if(le!=null){E.applyWith(le);}if(E.keys.length==0){E.keys=[{code:"000001",marketCode:"sz",key:"sz000001",name:"平安银行"},{code:"600036",marketCode:"sh",key:"sh600036",name:"招商银行"}];E.save();}E.profiteTotal=!0;E.save();d.log("Set profiteTotal to true to enable stock data display");if(d.log("platform:"+process.platform),d.log("sysVersion:"+process.getSystemVersion()),d.log("appVersion:"+u.app.getVersion()),se(r.config),st(),ot(),nt(),r.config.shortCutsSwitch){let e=r.config.shortCuts;
ee(e)}/* it(); // 禁用自动更新功能 */
let i=r.config;
u.app.setLoginItemSettings({openAtLogin:i.openAtLogin}),X(),m.show(),d.log("direct show indexWindow");}),m.didShowCallBack && m.didShowCallBack(); // 确保在窗口显示后立即触发股票更新
u.app.on("window-all-closed",()=>{u.globalShortcut.unregisterAll(),u.app.quit()});
u.app.on("will-quit",()=>{u.globalShortcut.unregisterAll()});
u.app.on("second-instance",()=>{m.win&&(m.win.isMinimized()&&m.win.restore(),m.win.focus())});
u.app.on("activate",()=>{const i=u.BrowserWindow.getAllWindows();
i.length?i[0].focus():m.show()});
u.app.on("before-quit",()=>{W.poke("WillQuit.App",null),r.config.save()});
function st(){setInterval(()=>{if(!v.isOpened("vip")){let i=r.config.countDownTimeSec;
i>0&&(i=i-10,r.applyWith({countDownTimeSec:i}))}},60*1e3)}function se(i){let e=i.proxySwitch;
e==!1?A.cleanProxy():A.setProxy(e.proxyHost,e.proxyPort,e.proxyUserName,e.proxyPassWord)}function ee(i){u.globalShortcut.unregisterAll(),u.globalShortcut.register(i.boss,()=>{m.isShow()?m.hideFromScreen():m.showOnScreen()}),u.globalShortcut.register(i.adds,()=>{O(null,"addstock",null)});
let e=5;
i.addo&&u.globalShortcut.register(i.mino,()=>{let t=r.config;
t.opa=t.opa-e,t.opa<0&&(t.opa=0),r.applyWith({opa:t.opa})}),i.mino&&u.globalShortcut.register(i.addo,()=>{let t=r.config;
t.opa=t.opa+e,t.opa>100&&(t.opa=100),r.applyWith({opa:t.opa})}),i.preg&&u.globalShortcut.register(i.preg,()=>{var t;
(t=m.win)==null||t.webContents.send("preg")}),i.nextg&&u.globalShortcut.register(i.nextg,()=>{var t;
(t=m.win)==null||t.webContents.send("nextg")})}function O(i,e,t){var n,o,a;
d.logDebug("window:size: "+e+" - "+t);
var s;
if(e=="login")s=new Se,s.onLoginFinish=l=>{Ce(l),X(),i.sender.send("loginOK")};
else if(e=="setting")s=new de;
else if(e=="vip")s=new $e;
else if(e=="addstock")s=new Ue;
else if(e=="help")s=new de,s.setRoute("/setting/help");
else if(e=="cost")try{let l=v.winMap[e];
l&&l.win?((n=l.win)==null||n.focus(),l.setStock(t),l.reload()):(s=new Qe,s.setStock(t))}catch(l){console.log(l)}else if(e=="ext"){if(t.startsWith("https://")||t.startsWith("http://")){let l=r.config.InviteCode;
l!=null&&l!=""&&(t=t+"&invite="+l)}u.shell.openExternal(t)}else if(e=="invite")s=new Xe;
else if(e=="chart")try{let l=v.winMap[e];
l&&l.win?((o=l.win)==null||o.focus(),l.setStock(t),l.reload()):(s=new et,s.setStock(t))}catch(l){console.log(l)}else e=="advice"&&(s=new tt);
if(s){s.setWinName(e);
let l=v.winMap[e];
if(l&&l.win){(a=l.win)==null||a.focus();
return}v.addWinMap(e,s),s.show()}}function nt(){Ze(),u.ipcMain.on("native::open",(i,e,t)=>{O(i,e,t)}),u.ipcMain.on("window:size",async(i,e,t)=>{let s=u.BrowserWindow.fromWebContents(i.sender);
if(s==null)return;
d.log("window:size: "+e+" - "+t);
let n=s.getBounds(),o=m.hideType;
o==0||o==1||o==4?n.x=n.x:n.x=n.x+(n.width-e),n.width=e,n.height=t,s.setBounds(n)}),u.ipcMain.on("close-win",i=>{let e=u.BrowserWindow.fromWebContents(i.sender);
e==null||e.close()}),u.ipcMain.on("open-dev",i=>{i.sender.openDevTools({mode:"detach"})}),u.ipcMain.on("statistic",(i,e,t)=>{W.poke(e,t)}),u.ipcMain.removeHandler("api"),u.ipcMain.handle("api",async(i,e,t,s)=>{if(d.logDebug("api: "+e+" - "+t),e=="searchStock"){W.poke("Search",[t]);
let n=await A.getSugs(t);
if(n.length<10){let o=await A.getSinaSugs(t);
n=n.concat(o)}return{token:t,data:n}}else{if(e=="addStock")return T.addStock(i,t);
if(e=="goods")return await C.getGoodsInfo();
if(e=="payurl")return await C.getPayURL(t);
if(e=="delStock")return T.removeStock(i,t);
if(e=="topStock")return T.setTopStock(i,t);
if(e=="paystatus")return await C.getPayStatus(t);
if(e=="userinfo"){if(!r.config.token)return;
let n=await C.getUserInfo();
if(n){let o={nickName:n.NickName,token:n.Token,avatar:n.Avatar,validTime:n.ValidTime,dueTo:n.DueTo,NewUser:n.NewUser,InviteUserID:n.InviteUserID,InviteCode:n.InviteCode};
return r.applyWith(o),o}else return null}else{if(e=="uploadLogs")return await d.compressAndSend();
if(e=="isAeroGlassEnabled")return u.systemPreferences.isAeroGlassEnabled();
if(e=="shortCut"){let n={},o=r.config.shortCuts;
n=Object.assign(n,o),n=Object.assign(n,t);
try{ee(n)}catch(a){return d.log(a.stack+""),!1}return r.applyWith({shortCuts:n}),!0}else if(e=="log")d.log(t);
else if(e=="checkTstock"){let n=new U("000001","sh");
return n.extra="ZS",n.key="sh000001",n.market="A\u80A1",n.name="\u4E0A\u8BC1\u6307\u6570",await A.getStocks([n],!1)}else if(e=="checkSstock"){let n=new U("bc0","qh");
return n.extra="sina_qh",n.key="nf_BC0",n.market="\u671F\u8D27",n.name="\u56FD\u9645\u94DC\u8FDE\u7EED",await A.getSinaStocks([n])}else{if(e=="openLogDir")return d.openLogDir();
if(e=="fillInviteCode"){let n=await C.fillInviteCode(t);
return n.code==200&&n.data==!0&&r.applyWith({InviteUserID:1}),n}else{if(e=="vipDetail")return await C.getVipDetail();
if(e=="fenshi")return await A.getFenShiData(t);
if(e=="getstock")return T.getStock(t);
if(e=="exit")W.poke("ExitStill.App",null),setTimeout(()=>{u.app.quit()},600);
else{if(e=="send_advice")return await C.sendAdvice(t);
if(e=="configPath")return r.getPath();
if(e=="testProxy")return C.testProxy(t.proxyHost,t.proxyPort);
if(e=="exception")return u.app.isPackaged?await C.sendException(t):!1;
if(e=="gpuInfo")return u.app.getGPUFeatureStatus();
if(e=="dayk")return await A.getDaykData(t);
if(e=="mk")return await A.getMkData(t,s)}}}}}}),u.ipcMain.removeHandler("config"),u.ipcMain.handle("config",async(i,e,t)=>{if(d.log("config: "+e+" - "+t),e=="get")return r.config;
if(e=="set")r.applyWith(t);
else if(e=="set_reload")r.applyWith(t),t.openAtLogin==!0?u.app.setLoginItemSettings({openAtLogin:!0}):t.openAtLogin==!1&&u.app.setLoginItemSettings({openAtLogin:!1});
else if(e=="set_alias")r.setAlias(t.key,t.alias);
else{if(e=="getversion")return u.app.getVersion();
if(e=="set_cost")r.setCost(t.key,t.price,t.amount);
else if(e=="set_alert")W.poke("Cost.Alert.CK",t),r.setAlert(t.key,t);
else if(e=="set_shortcuts_switch"){if(t.shortCutsSwitch==!0){u.globalShortcut.unregisterAll();
let s=r.config.shortCuts;
ee(s)}else t.shortCutsSwitch==!1&&u.globalShortcut.unregisterAll();
r.applyWith(t)}}}),u.ipcMain.handle("window",async(i,e,t)=>{d.logDebug("window: "+e+" - "+t);
const s=u.BrowserWindow.fromWebContents(i.sender);
if(s==null)return null;
if(e=="getpos"){let n=s==null?void 0:s.getPosition();
return{x:n[0],y:n[1]}}else if(e=="setpos"){m.win==s&&(m.hideType=0);
let n=s.getBounds(),o=u.screen.getDisplayMatching(n).scaleFactor;
if(o!==1&&o!==2&&o!==3){n.x=t.x,n.y=t.y,s==null||s.setBounds(n);
let a=s.getBounds(),l=a.width-n.width,c=a.height-n.height;
l<=2&&c<=2&&l>=0&&c>=0&&(n.width-=l,n.height-=c,s==null||s.setBounds(n))}else s.setPosition(Math.floor(t.x),Math.floor(t.y));
return!0}else if(e=="checkhide"&&s==m.win)m.hideIfOnScreenBorder();
else if(e=="checkshow"&&s==m.win)W.poke("IW.mouseIn",null),m.showIfOnScreenBorder();
else if(e=="savebounds"){let n=s.getBounds();
if(t!="chart"&&JSON.stringify(n)==JSON.stringify(r.config.bounds)){console.log("bounds not change.dont save.");
return}r.editWith(o=>{t=="chart"?o.chartBounds=n:o.bounds=n})}})}var z;
function ot(){let e=u.app.isPackaged?V.default.join(process.resourcesPath,"logo.png"):V.default.join(__dirname,"../renderer","logo.png");
d.log("path icon:"+e);
try { z=new u.Tray(e); } catch(error) { d.log("Failed to create tray icon:" + error.message); z=null; }
const t=u.Menu.buildFromTemplate([{label:"\u6253\u5F00\u8BBE\u7F6E\u9875\u9762",click:async function(){O(null,"setting",null)}},{label:"\u91CD\u7F6E\u8F6F\u4EF6",click:async function(){const s={type:"info",title:"\u91CD\u7F6E\u8F6F\u4EF6\uFF1F",message:"\u91CD\u7F6E\u8F6F\u4EF6\uFF1F\u91CD\u7F6E\u540E\u6240\u6709\u914D\u7F6E\u4F1A\u6062\u590D\u5230\u521D\u59CB\u72B6\u6001.",buttons:["\u5426","\u662F"]};
(await u.dialog.showMessageBox(s)).response==1&&(r.restore(),se(r.config))}},{label:"\u6A21\u5F0F\u5207\u6362",click:function(){var s;
(s=m.win)==null||s.webContents.send("uimodechange")}},{label:"\u9762\u677F\u5C45\u4E2D",click:async function(){const s={type:"info",title:"\u627E\u4E0D\u5230\u9762\u677F\u4E86\uFF1F",message:"\u8BE5\u884C\u4E3A\u4F1A\u628A\u4F60\u9762\u677F\u653E\u5230\u5C4F\u5E55\u4E2D\u95F4\u5E76\u4E14\u663E\u793A\u51FA\u6765",buttons:["\u5426","\u662F"]};
(await u.dialog.showMessageBox(s)).response==1&&(m.setToCenter(),m.showOnScreen())}},{label:"\u4E0A\u4F20\u65E5\u5FD7",click:async function(){const s={type:"info",title:"\u662F\u5426\u4E0A\u4F20\u65E5\u5FD7\uFF1F",message:"\u8BE5\u884C\u4E3A\u4F1A\u628A\u4F60\u7684\u8C03\u8BD5\u65E5\u5FD7\u4E0A\u4F20\u7ED9\u5F00\u53D1\u8005\u5E2E\u52A9\u5206\u6790\u95EE\u9898\u3002",buttons:["\u5426","\u662F"]};
(await u.dialog.showMessageBox(s)).response==1&&await d.compressAndSend()}},{label:"\u9000\u51FA",click:function(){r.checkFirstLaunchAndQuickExit()?(W.poke("QuickExit.IM",null),O(null,"advice",null)):(W.poke("CF.OUT",null),setTimeout(()=>{u.app.quit()},700))}}]);
if(z) { z.setToolTip("\u5E7D\u7075\u770B\u76D8"); z.setContextMenu(t); z.on("double-click",function(){m.showIfOnScreenBorder(),m.showOnScreen()}); } u.Menu.setApplicationMenu(null); }
r.on("onConfig",async(i,e)=>{let t=!1;
for(let s in e){let n=e[s];
    (n=="keys"||n=="cost"||n=="alias"||n=="alertInfos"||n=="groups")&&(t=!0)}// 注释掉配置同步 - 跳过向后端推送配置
/*
if(t&&r.config.token&&r.config.token!=""){let s=await C.syncData(!0);
    i.applyWith({synUpdateTime:s})}
*/
    e.length>=1&&e[0]=="proxySwitch"&&se(i)});
T.onEvent("alertPrice",async function(i){if($[i.key]){d.log(i.key+" already alert.");
return}$[i.key]=!0;
const e={type:"info",title:"\u63D0\u9192",message:i.text,buttons:["\u77E5\u9053\u4E86","\u4E0D\u518D\u63D0\u9192"]};
(await u.dialog.showMessageBox(e)).response==1&&r.setAlert(i.key,{key:i.key,at:i.at,v:!1}),delete $[i.key]});
//# sourceMappingURL=index.cjs.map;