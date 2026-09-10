"use strict";
Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});

var E=require("./element-plus.82ea9b6e.js");

var u=require("electron");

var Ae=require("./lodash.d573f061.js");

var De=require("./data_type.8836b364.js");

var ze=require("./plugin-vue_export-helper.d4c26e4c.js");

var o=require("./@vue.d56d68ba.js");

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

const W=A=>(o.pushScopeId("data-v-a1d86ae8"),A=A(),o.popScopeId(),A),
Me=W(()=>o.createBaseVNode("canvas",{id:"measures",style:{display:"none"}},null,-1)),
Te={key:0,id:"loading"},
We={key:3},
Pe=["onClick"],qe={key:4,style:{"font-size":"10px",padding:"2px","text-align":"right","margin-right":"5px"}},
Ie=W(()=>o.createBaseVNode("span",null,"\u5408\u8BA1",-1)),
He=W(()=>o.createBaseVNode("span",{style:{"margin-left":"5px"}},"\u603B:",-1)),
$e=W(()=>o.createBaseVNode("span",{style:{"margin-left":"5px"}},"\u5F53\u65E5:",-1)),
Oe={key:5,style:{background:"rgba(0,0,0,0)",width:"100%",height:"1px","margin-top":"-1px","z-index":"10",position:"absolute"}},


Ge=o.defineComponent({
    __name:"index",
    setup(A){
function pe(){var e,n;let t={};if(b){let r=(n=(e=b.value)==null?void 0:e.getElementsByClassName("el-table__body")[0].clientWidth)!=null?n:300;t.width=r+"px"}else t.display="none";return t["overflow-x"]="hidden",t.display="inline-block",t["white-space"]="nowrap",t}
function O(t){let e={};return t=="d"?v&&v.value=="classic"?N.fvalue>0?e.color="#f56c6c":N.fvalue<0&&(e.color="#67c23a"):e.color=p(i.textColorNew,i.textAlpha):v&&v.value=="classic"?S.fvalue>0?e.color="#f56c6c":S.fvalue<0&&(e.color="#67c23a"):e.color=p(i.textColorNew,i.textAlpha),e}const y=o.ref([]);window.onerror=function(t,e,n,r,l){let a="indexWindow:"+t+"|e|"+e+"|s|"+n+"|l|"+r+"|c|"+l+"|e|"+(l==null?void 0:l.stack);u.ipcRenderer.invoke("api","exception",a),console.log(a)},u.ipcRenderer.send("statistic","Home.IM",null);
function fe(t){if(t.key){let e=i.alertsKey;e[t.key]=!0,u.ipcRenderer.invoke("config","set_reload",{alertsKey:e})}}
function U(t,e){var n=document.querySelector("#measures"),r=n.getContext("2d");r.font=e;var l=r.measureText(t);return l.width}
function G(t){if(!i||y.value.length==0)return 0;let e=i.fontSize,n=null,r=y.value;for(let l=0;l<r.length;l++){let a=r[l].stock;if(!a){console.log("stock error:"),console.log(r[l]);continue}if(t=="name"){let d=U(J(a.key,a.name),e);(n==null||d<n)&&(n=d)}else{let d=U(c(t,a),e);(n==null||d<n)&&(n=d)}}return n==null&&(n=50),n+=4,n}
function ve(t){let e={"max-width":"800px","min-width":"10px","font-size":m.value,"line-height":m.value};return e.padding="1 1 1 1",e["border-bottom"]="none",i&&(e.backgroundColor=p(i.backColorNew,i.backAlpha),e.color=p(i.textColorNew,i.textAlpha)),e}
function me(t){if(!t.row.stock)return null;let e={"max-width":"800px","min-width":"10px","font-size":m.value,"line-height":m.value};
if(e["border-bottom"]="none",!i)return e;
if(t.column.label=="\u5F53\u65E5\u76C8\u4E8F")v&&v.value=="classic"?t.row.stock.dayProfite>0?e.color="#f56c6c":t.row.stock.dayProfite<0&&(e.color="#67c23a"):e.color=p(i.textColorNew,i.textAlpha);
else if(t.column.label=="\u6DA8\u8DCC\u5E45")v&&v.value=="classic"?t.row.stock.per>0?e.color=p("#f56c6c",i.textAlpha):t.row.stock.per<0?e.color=p("#67c23a",i.textAlpha):e.color=p("#e9e9eb",i.textAlpha):e.color=p(i.textColorNew,i.textAlpha);
else if(t.column.label=="\u603B\u76C8\u4E8F"&&i){let n=i.cost[t.row.stock.key];n&&v&&v.value=="classic"?t.row.stock.price>n.price?e.color="#f56c6c":t.row.stock.price<n.price&&(e.color="#67c23a"):e.color=p(i.textColorNew,i.textAlpha)}else e.color=p(i.textColorNew,i.textAlpha);return e.padding="1 1 1 1",e.backgroundColor=p(i.backColorNew,i.backAlpha),e}
function J(t,e){if(i){let n=i.alias[t];return n||e}else return e}
function c(t,e){if(!i||!e)return"-";let n=2;if((e.extra=="ETF"||e.extra=="QDII-ETF")&&(n=3),t=="per"&&e.per!=null&&e.price!=null)return(e.per*100).toFixed(2)+"%";
if(t=="price"&&e.price)return e.price.toFixed(n);if(t=="preClose"&&e.preClose)return e.preClose.toFixed(n);if(t=="dayMax"&&e.dayMax)return e.dayMax.toFixed(n);
if(t=="dayMin"&&e.dayMin)return e.dayMin.toFixed(n);if(t=="buy1Vo"&&e.buy1Vo)return e.buy1Vo;if(t=="sell1Vo"&&e.sell1Vo)return e.sell1Vo;if(t=="open"&&e.open)return e.open.toFixed(n);
if(t=="volume"){if(!e.volume)return"-";let l=e.volume/100,a="\u624B";return l>1e4&&(l=l/1e4,a="\u4E07\u624B"),l>1e4&&(l=l/1e4,a="\u4EBF\u624B"),l.toFixed(2)+a}else if(t=="amount"){if(!e.amount)return"-";let l=e.amount,a="";return l>1e4&&(l=l/1e4,a="\u4E07"),l>1e4&&(l=l/1e4,a="\u4EBF"),l.toFixed(2)+a}else{if(t=="swap")return e.swap?(e.swap*100).toFixed(2)+"%":"-";
if(t=="abr")return e.abr?(e.abr*100).toFixed(2)+"%":"-";if(t=="pro_t"){if(!e.totalPro)return"-";let r=e.totalPro,l=e.totalProPer;return r&&l?i.profitMode=="ap"?r.toFixed(2)+"("+(l*100).toFixed(2)+"%)":i.profitMode=="a"?r.toFixed(2):(l*100).toFixed(2)+"%":"-"}else if(t=="pro_d"){if(!e.dayProfite)return"-";let r=e.dayProfite;return r?r.toFixed(2):"-"}else if(t=="cost"){if(!e.cost)return"-";let r=e.cost;return r?r.toFixed(2):"-"}}return console.log("pureGeneralFormatter Wrong:"+t),"-"}
function he(t,e){if(!i)return"-";let n=t.stock;if(!n)return"-";let r=e.label;return r=="\u603B\u76C8\u4E8F"?c("pro_t",n):r=="\u5F53\u65E5\u76C8\u4E8F"?c("pro_d",n):r=="\u6DA8\u8DCC\u5E45"?c("per",n):r=="\u73B0\u4EF7"?c("price",n):r=="\u6628\u6536"?c("preClose",n):r=="\u4ECA\u5F00"?c("open",n):r=="\u6210\u4EA4\u91CF"?c("volume",n):r=="\u6210\u4EA4\u989D"?c("amount",n):r=="\u6362\u624B\u7387"?c("swap",n):r=="\u59D4\u6BD4"?c("abr",n):r=="\u6700\u9AD8"?c("dayMax",n):r=="\u6700\u4F4E"?c("dayMin",n):r=="\u4E70\u4E00"?c("buy1Vo",n):r=="\u5356\u4E00"?c("sell1Vo",n):r=="\u6210\u672C\u4EF7"?c("cost",n):"-"}const ge=require("element-resize-detector"),b=o.ref(),k=o.ref("nm"),K=o.ref([]),f=o.ref(),j=o.ref(),m=o.ref("15px"),X=o.ref(!1),v=o.ref(""),Y=o.ref(!1),L=o.ref(!0),Q=o.ref(),P=o.ref("rgba(0,0,0,0)"),we=o.ref("rgba(0,0,0,0)"),F=o.ref([]),q=o.ref(!1),S=o.ref("0"),N=o.ref("0"),h=o.ref(!1),D=o.ref([]);var I,i,H,_=[],g="\u672A\u5206\u7EC4";
function z(t){g=t,h.value&&(h.value=!1,o.nextTick(function(){h.value=!0})),ee()}
function xe(t){return t!=g}
function ee(){if(g=="\u5168\u90E8")y.value=_;else if(g=="\u672A\u5206\u7EC4"){let t=[];for(let e in _){let n=_[e];(n.sug.group==null||n.sug.group.length==0)&&t.push(n)}y.value=t}else{let t=[];for(let e in _){let n=_[e];Object.prototype.toString.call(n.sug.group)==="[object String]"?n.sug.group==g&&t.push(n):ye(n.sug.group,g)&&t.push(n)}y.value=t}}
function ye(t,e){for(let n in t)if(t[n]==e)return!0;return!1}u.ipcRenderer.on("stock-update",(t,e)=>{if(q.value){let n=0,r=0;for(let l in e.data){let a=e.data[l].stock;n+=a.totalPro,r+=a.dayProfite}S.value=n.toFixed(2),S.fvalue=n,N.value=r.toFixed(2),N.fvalue=r}_=e.data,ee(),L.value=!0,I&&window.clearTimeout(I),I=window.setTimeout(()=>{L.value=!1},500)}),u.ipcRenderer.on("app-config",(t,e,n)=>{ie(e,n)}),u.ipcRenderer.on("uimodechange",(t,e)=>{ae()}),u.ipcRenderer.on("forceUpdate",t=>{Y.value=!0}),u.ipcRenderer.on("preg",(t,e)=>{if(!h.value)return;let n=D.value,r=n.indexOf(g);r-1==-1?r=n.length-1:r=r-1,z(n[r])}),u.ipcRenderer.on("nextg",(t,e)=>{if(!h.value)return;let n=D.value,r=n.indexOf(g);r+1==n.length?r=0:r=r+1,z(n[r])}),o.onBeforeUpdate(async()=>{});
function ke(t,e){let n=[];for(let r in e){let l=e[r],a=l.key;a&&t[a]||n.push(l)}return n}function te(t){let e=document.getElementById("groupsbox");e&&(e.scrollLeft-=t.wheelDelta/5)}o.onMounted(async()=>{ge().listenTo(b.value,n=>{u.ipcRenderer.send("window:size",n.clientWidth+1,n.clientHeight+1)});const e=await u.ipcRenderer.invoke("config","get");
if(ie(e,null),L.value=!1,u.ipcRenderer.send("fetch-stock"),0){let n=ke(e.alertsKey,e.dynamicConfig.broadcast.alerts),r=F.value;F.value=r.concat(n)}document.addEventListener("click",ue),document.addEventListener("contextmenu",de),document.addEventListener("mouseleave",ce),document.addEventListener("mouseenter",se),document.addEventListener("keyup",n=>{n.keyCode==27&&ae()}),document.addEventListener("mousedown",oe),document.addEventListener("mousemove",ne),document.addEventListener("mouseup",re),document.addEventListener("wheel",te),H&&window.clearInterval(H),u.ipcRenderer.invoke("api","userinfo"),H=window.setInterval(()=>{u.ipcRenderer.invoke("api","userinfo")},1e3*60*5)});var R=!1,M,$;const oe=async t=>{t.which===1?(M=await u.ipcRenderer.invoke("window","getpos"),$={x:t.screenX,y:t.screenY},R=M!=null):R=!1},ne=t=>{if(R&&t.which===1){let e=t.screenX-$.x,n=t.screenY-$.y;u.ipcRenderer.invoke("window","setpos",{x:e+M.x,y:n+M.y,animate:!0})}},re=t=>{R=!1,u.ipcRenderer.invoke("window","savebounds")};o.onUnmounted(()=>{document.removeEventListener("click",ue),document.removeEventListener("mouseleave",ce),document.removeEventListener("mouseenter",se),document.removeEventListener("contextmenu",de),document.removeEventListener("mousedown",oe),document.removeEventListener("mousemove",ne),document.removeEventListener("mouseup",re),document.removeEventListener("wheel",te)});
function p(t,e){let n="";return n=e.toString(16),n.length==1&&(n="0"+n),t+n}var le=145;const ie=(t,e)=>{k.value=t.model;let n=[];for(let l in t.column){let a=t.column[l],d=De.DataType.getTyepByValue(a);n.push(d)}K.value=n,m.value=t.fontSize+"px",le=t.fontSize/15*145,X.value=t.token!=null&&t.validTime>0,v.value=t.themeMode,P.value=p(t.backColorNew,t.backAlpha),we.value=p(t.textColorNew,t.textAlpha),q.value=t.profiteTotal,h.value=t.groupsSwitch,t.groupsSwitch==!1&&z("\u5168\u90E8");let r=t.groups;r[0]!="\u672A\u5206\u7EC4"&&r.unshift("\u672A\u5206\u7EC4"),D.value=t.groups,i=t,e!=null&&(e[0]=="alias"||e[0]=="cost"||e[0]=="backColorNew"||e[0]=="backAlpha"||e[0]=="textColorNew"||e[0]=="textAlpha"||e[0]=="profitMode")&&(Q.value=Math.random())},Ce=(t,e,n)=>{let r=n.getBoundingClientRect();return t>r.left&&t<r.left+r.width&&e>r.top&&e<r.top+r.height};

function B(t){t.startsWith("https://")||t.startsWith("http://")?(u.ipcRenderer.send("native::open","ext",t),u.ipcRenderer.send("statistic","Home.Ext.CK",{href:t})):(u.ipcRenderer.send("native::open",t),u.ipcRenderer.send("statistic","Home.Function.CK",{page:t}))}const ae=()=>{f.value!=null&&C(),k.value=="nm"?u.ipcRenderer.invoke("config","set",{model:"sm"}):u.ipcRenderer.invoke("config","set",{model:"nm"})},ue=t=>{f.value!=null&&(Ce(t.x,t.y,j.value)||C())},se=()=>{u.ipcRenderer.invoke("window","checkshow")},ce=()=>{C(),R=!1,u.ipcRenderer.invoke("window","checkhide")},de=t=>{},_e=()=>{var e,n;return(n=(e=b.value)==null?void 0:e.getElementsByClassName("el-table__row")[0].clientHeight)!=null?n:35},Be=()=>{var e,n;
if(k.value=="sm")return 0;let t=(n=(e=b.value)==null?void 0:e.getElementsByTagName("thead")[0].clientHeight)!=null?n:31;return h.value?t+24:t};var w=null;const Ee=(t,e,n)=>{var x,V;w=t;let r=_e(),l=le;l>window.innerWidth&&(l=window.innerWidth);let a={x:n.x,y:n.y,rowheight:r+"px",width:`${l}px`},d=Be(),T=Ae.lodash.exports.toInteger((a.y-d)/r);
if(T>=y.value.length)return;let s=(V=(x=j.value)==null?void 0:x.clientWidth)!=null?V:l;a.y=T*r+d,a.x-=s/2,a.x+s>window.innerWidth&&(a.x=window.innerWidth-s),a.x<0&&(a.x=0),a.x+s>window.innerWidth&&a.x==0&&(a.width=window.innerWidth+"px"),f.value=a};
function Fe(){if(w==null)return!1;let t=w.sug;return t.marketCode=="sz"||t.marketCode=="sh"||t.marketCode=="hk"||t.marketCode=="bj"}
function C(){w=null,f.value=null}
const Se=t=>{u.ipcRenderer.send("statistic","Home.Shares.CK",{pt:"\u5206\u65F6"}),t.stopPropagation();let e=w;e&&e.sug&&u.ipcRenderer.send("native::open","chart",{key:e.sug.key,marketCode:e.sug.marketCode}),C()},
Ne=t=>{u.ipcRenderer.send("statistic","Home.Shares.CK",{pt:"\u6210\u672C"}),t.stopPropagation();let e=w;e&&e.sug&&u.ipcRenderer.send("native::open","cost",e.sug.key),C()},
Re=t=>{t.stopPropagation();let e=w;e&&e.sug&&u.ipcRenderer.invoke("api","topStock",JSON.parse(JSON.stringify(e.sug))),C()},
Ve=async t=>{u.ipcRenderer.send("statistic","Home.Shares.CK",{pt:"\u5220\u9664"}),t.stopPropagation();let e=w;e&&e.sug&&await u.ipcRenderer.invoke("api","delStock",JSON.parse(JSON.stringify(e.sug))),C()};
return(t,e)=>{const n=E.ElButton,r=E.ElTableColumn,l=E.ElTable,a=E.ElAlert,d=E.ElCol,T=E.ElRow;return o.openBlock(),o.createElementBlock("div",{id:"table",ref_key:"tableDom",ref:b,style:o.normalizeStyle({background:P.value})},[Me,L.value?(o.openBlock(),o.createElementBlock("div",Te,"+")):o.createCommentVNode("",!0),h.value&&k.value=="nm"?(o.openBlock(),o.createElementBlock("div",{key:1,id:"groupsbox",style:o.normalizeStyle(pe())},[(o.openBlock(!0),o.createElementBlock(o.Fragment,null,o.renderList(D.value,s=>(o.openBlock(),o.createBlock(n,{onClick:x=>z(s),color:"#E9EEFF",style:{"margin-left":"0px",border:"1px",color:"black"},type:"info",plain:xe(s)},{default:o.withCtx(()=>[o.createTextVNode(o.toDisplayString(s),1)]),_:2},1032,["onClick","plain"]))),256))],4)):o.createCommentVNode("",!0),Y.value==!1?(o.openBlock(),o.createBlock(l,{id:"mainTable",key:Q.value,data:y.value,stripe:"","show-header":k.value=="nm","table-layout":"auto","header-cell-style":ve,"cell-style":me,onRowContextmenu:Ee},{empty:o.withCtx(()=>[o.createBaseVNode("a",{style:{color:"#238CF7"},onClick:e[0]||(e[0]=s=>B("addstock"))},"\u6DFB\u52A0\u80A1\u7968")]),default:o.withCtx(()=>[o.createVNode(r,{align:"center",label:"\u80A1\u7968\u540D",width:G("name")},{default:o.withCtx(s=>{var x,V;return[o.createTextVNode(o.toDisplayString(J((x=s.row.stock)==null?void 0:x.key,(V=s.row.stock)==null?void 0:V.name)),1)]}),_:1},8,["width"]),(o.openBlock(!0),o.createElementBlock(o.Fragment,null,o.renderList(K.value,s=>(o.openBlock(),o.createBlock(r,{prop:"stock.per",sortable:s.sor==!0,align:"center",label:s.name,formatter:he,width:G(s.key)},null,8,["sortable","label","width"]))),256))]),_:1},8,["data","show-header"])):(o.openBlock(),o.createElementBlock("div",We," \u8BF7\u66F4\u65B0\u5230\u6700\u65B0\u7248\u672C\uFF0C\u5F53\u524D\u7248\u672C\u5DF2\u4E0D\u518D\u652F\u6301. ")),(o.openBlock(!0),o.createElementBlock(o.Fragment,null,o.renderList(F.value,s=>(o.openBlock(),o.createElementBlock(o.Fragment,null,[o.createCommentVNode("",!0)],64))),256)),q.value?(o.openBlock(),o.createElementBlock("div",qe,[Ie,He,o.createBaseVNode("span",{style:o.normalizeStyle(O("t"))},o.toDisplayString(S.value),5),$e,o.createBaseVNode("span",{style:o.normalizeStyle(O("d"))},o.toDisplayString(N.value),5)])):o.createCommentVNode("",!0),k.value=="nm"?(o.openBlock(),o.createElementBlock("div",Oe)):o.createCommentVNode("",!0),k.value=="nm"?(o.openBlock(),o.createBlock(T,{key:6,gutter:0,justify:"center",style:o.normalizeStyle({height:"22px",background:P.value})},{default:o.withCtx(()=>[o.createVNode(d,{span:6},{default:o.withCtx(()=>[o.createBaseVNode("button",{class:"plus",onClick:e[1]||(e[1]=s=>B("addstock"))})]),_:1}),o.createVNode(d,{span:6},{default:o.withCtx(()=>[o.createBaseVNode("button",{class:"setting",onClick:e[2]||(e[2]=s=>B("setting"))})]),_:1}),o.createVNode(d,{span:6},{default:o.withCtx(()=>[o.createBaseVNode("button",{class:"exit",onClick:e[3]||(e[3]=s=>{u.ipcRenderer.invoke("api","exit")})})]),_:1})]),_:1},8,["style"])):o.createCommentVNode("",!0),f.value!=null?(o.openBlock(),o.createElementBlock("div",{key:7,ref_key:"menuDomRef",ref:j,class:"float-menu",style:o.normalizeStyle({top:f.value.y+"px",left:f.value.x+"px",height:f.value.rowheight,"min-width":f.value.width})},[o.createBaseVNode("a",{style:o.normalizeStyle({"line-height":f.value.rowheight,"font-size":m.value}),class:"alias",onClick:Ne},"\u66F4\u591A",4),o.createBaseVNode("a",{style:o.normalizeStyle({"line-height":f.value.rowheight,"font-size":m.value}),class:"top",onClick:Re},"\u7F6E\u9876",4),Fe()?(o.openBlock(),o.createElementBlock("a",{key:0,style:o.normalizeStyle({"line-height":f.value.rowheight,"font-size":m.value}),class:"invite",onClick:Se},"\u66F2\u7EBF",4)):o.createCommentVNode("",!0),o.createBaseVNode("a",{style:o.normalizeStyle({"line-height":f.value.rowheight,"font-size":m.value}),class:"del",onClick:Ve},"\u5220\u9664",4)],4)):o.createCommentVNode("",!0)],4)}
}
});
var Je=ze._export_sfc(Ge,[["__scopeId","data-v-a1d86ae8"]]);exports.default=Je;

