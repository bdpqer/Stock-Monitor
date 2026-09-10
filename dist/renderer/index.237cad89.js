"use strict";
Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});

var n=require("./element-plus.82ea9b6e.js");

var c=require("electron");

var l=require("./plugin-vue_export-helper.d4c26e4c.js");

var e=require("./@vue.d56d68ba.js");

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

const t=u=>(e.pushScopeId("data-v-833eb3a2"),u=u(),e.popScopeId(),u),_=t(()=>e.createBaseVNode("div",{style:{width:"100%",height:"1px",background:"#dfdfdf"}},null,-1)),f=t(()=>e.createBaseVNode("span",null,"\u901A\u7528",-1)),h=t(()=>e.createBaseVNode("span",null,"\u5FEB\u6377\u952E",-1)),x=t(()=>e.createBaseVNode("span",null,"\u5206\u7EC4",-1)),m=t(()=>e.createBaseVNode("span",null,"\u4EE3\u7406\u8BBE\u7F6E",-1)),v=t(()=>e.createBaseVNode("span",null,"\u5E2E\u52A9",-1)),w=t(()=>e.createBaseVNode("span",null,"\u5907\u4EFD\u914D\u7F6E",-1)),C=e.defineComponent({__name:"index",setup(u){return c.ipcRenderer.send("statistic","Setup.IM",null),(E,j)=>{const o=n.ElMenuItem,r=n.ElMenu,a=n.ElAside,s=e.resolveComponent("router-view"),d=n.ElMain,i=n.ElContainer;
return e.openBlock(),e.createElementBlock(e.Fragment,null,[_,e.createVNode(i,{style:{width:"100%"}},{default:e.withCtx(()=>[e.createVNode(a,{class:"setaside",width:"170px"},{default:e.withCtx(()=>[e.createVNode(r,{"default-active":"1",router:!0},{default:e.withCtx(()=>[e.createVNode(o,{index:"1",route:"/setting/general"},{default:e.withCtx(()=>[f]),_:1}),e.createVNode(o,{index:"2",route:"/setting/keys"},{default:e.withCtx(()=>[h]),_:1}),e.createVNode(o,{index:"3",route:"/setting/groups"},{default:e.withCtx(()=>[x]),_:1}),e.createVNode(o,{index:"4",route:"/setting/proxy"},{default:e.withCtx(()=>[m]),_:1}),e.createVNode(o,{index:"5",route:"/setting/help"},{default:e.withCtx(()=>[v]),_:1}),e.createVNode(o,{index:"6",route:"/setting/doctor"},{default:e.withCtx(()=>[w]),_:1})]),_:1})]),_:1}),e.createVNode(d,{class:"setmain",width:"530px"},{default:e.withCtx(()=>[e.createVNode(s)]),_:1})]),_:1})],64)}}});
var g=l._export_sfc(C,[["__scopeId","data-v-833eb3a2"]]);
exports.default=g;

