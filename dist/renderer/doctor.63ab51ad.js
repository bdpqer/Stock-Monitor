"use strict";
Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});
var g=require("./element-plus.82ea9b6e.js"),n=require("electron"),I=require("./plugin-vue_export-helper.d4c26e4c.js"),e=require("./@vue.d56d68ba.js");
require("./lodash-es.ddea9911.js");
require("./@vueuse.890cd802.js");
require("./@element-plus.fa9c9259.js");
require("./@popperjs.fbdb10e6.js");
require("./@ctrl.1468e79e.js");
require("./dayjs.512f3e6f.js");
require("./clipboard.7fc21323.js");
require("./async-validator.a2deba43.js");
require("./memoize-one.846331f4.js");
require("./escape-html.10f0acfa.js");
require("./normalize-wheel-es.fee9c64f.js");
require("./@floating-ui.8e3ffa7f.js");
const P=p=>(e.pushScopeId("data-v-02cdbccd"),p=p(),e.popScopeId(),p),L={id:"content"},z={style:{"font-size":"12px"}},tip={style:{"font-size":"12px",color:"#909399","margin-top":"10px","line-height":"1.9","white-space":"pre-line"}},btnrow={style:{"margin-top":"18px"}};
const H=e.defineComponent({__name:"doctor",setup(p){
const cfgPath=e.ref(""),busy=e.ref(!1),msg=e.ref(""),msgType=e.ref("info");
(async()=>{try{cfgPath.value=await n.ipcRenderer.invoke("api","configPath")}catch(_){}})();
function notify(t,ty){msg.value=t;msgType.value=ty||"info";try{ty==="success"?g.ElMessage.success(t):ty==="error"?g.ElMessage.error(t):g.ElMessage.info(t)}catch(_){}}
async function backup(){if(busy.value)return;busy.value=!0;msg.value="";
try{let r=await n.ipcRenderer.invoke("api","backupConfig");
if(r&&r.ok)notify("配置已备份到："+r.path,"success");
else if(r&&r.canceled){}
else notify("备份失败"+(r&&r.error?"："+r.error:""),"error");
}catch(err){notify("备份失败："+err,"error")}finally{busy.value=!1}}
async function restore(){if(busy.value)return;busy.value=!0;msg.value="";
try{let r=await n.ipcRenderer.invoke("api","restoreConfig");
if(r&&r.ok)notify("恢复成功，应用即将自动重启…","success");
else if(r&&r.canceled){}
else notify("恢复失败"+(r&&r.error?"："+r.error:""),"error");
}catch(err){notify("恢复失败："+err,"error")}finally{busy.value=!1}}
return(u,i)=>{const a=g.ElButton;
return e.openBlock(),e.createElementBlock("div",L,[
e.createBaseVNode("div",z,"配置文件路径："+e.toDisplayString(cfgPath.value),1),
e.createBaseVNode("div",tip,"备份内容包括：自选股及顺序、成本价、股票备注、价格提醒、分组、快捷键、主题颜色、代理等全部设置。\n备份文件建议保存到桌面、网盘或 U 盘；换电脑时点击“恢复配置”选择该文件即可，恢复前会自动先留存一份当前配置，恢复后应用自动重启。",1),
e.createBaseVNode("div",btnrow,[
e.createVNode(a,{type:"primary",loading:busy.value,onClick:backup},{default:e.withCtx(()=>[e.createTextVNode("备份配置")]),_:1}),
e.createVNode(a,{loading:busy.value,style:{"margin-left":"10px"},onClick:restore},{default:e.withCtx(()=>[e.createTextVNode("恢复配置")]),_:1})
]),
msg.value?(e.openBlock(),e.createBaseVNode("div",{key:0,style:{"margin-top":"14px","font-size":"12px","color":msgType.value==="error"?"red":"green"},"white-space":"pre-wrap",wordbreak:"break-all"},e.toDisplayString(msg.value),1)):e.createCommentVNode("",!0)
])}}
});
var U=I._export_sfc(H,[["__scopeId","data-v-02cdbccd"]]);
exports.default=U;
