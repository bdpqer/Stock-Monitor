"use strict";
var t=require("./@vue.d56d68ba.js");

var f=require("./@element-plus.fa9c9259.js");

var a=require("./vue-router.1512422d.js");

require("./normalize.css.e4d8aef4.js");

var d=require("./element-plus.82ea9b6e.js");

require("./lodash-es.ddea9911.js");

require("./@vueuse.890cd802.js");

require("./@popperjs.fbdb10e6.js");

require("./@ctrl.1468e79e.js");

require("./dayjs.512f3e6f.js");

require("./clipboard.7fc21323.js");

require("./async-validator.a2deba43.js");

require("./memoize-one.846331f4.js");

require("./escape-html.10f0acfa.js");

require("./normalize-wheel-es.fee9c64f.js");

require("./@floating-ui.8e3ffa7f.js");

const E=function(){
const n=document.createElement("link").relList;
return n&&n.supports&&n.supports("modulepreload")?"modulepreload":"preload"
}();
var c={};
var v="./";
var e=function(n,i){return n()};
const h=t.defineComponent({__name:"App",setup(u){return(n,i)=>{const r=t.resolveComponent("router-view");return t.openBlock(),t.createBlock(r)
}}});

var P=a.createRouter({
history:a.createWebHashHistory(),
routes:[{path:"/",component:()=>e(()=>Promise.resolve().then(function(){return require("./index.8cbe8649.js")
}),void 0),name:"\u9996\u9875"},{path:"/chart",component:()=>e(()=>Promise.resolve().then(function(){return require("./chart.e7677c8e.js")
}),void 0),
name:"\u5206\u65F6"
},
{
path:"/advice",
component:()=>e(()=>Promise.resolve().then(function(){
return require("./advice.887b9a77.js")
}),void 0),
name:"\u95EE\u9898"
},
{
path:"/addstock",
component:()=>e(()=>Promise.resolve().then(function(){
return require("./addstock.8714a74b.js")
}),void 0),
name:"\u6DFB\u52A0\u80A1\u7968"
},
{
path:"/login",
component:()=>e(()=>Promise.resolve().then(function(){
return require("./login.509cc858.js")
}),void 0),
name:"\u767B\u5F55\u9875\u9762"
},
{
path:"/invite",
component:()=>e(()=>Promise.resolve().then(function(){
return require("./invite.afa5304b.js")
}),void 0),
name:"\u9080\u8BF7"
},
{path:"/cost",component:()=>e(()=>Promise.resolve().then(function(){return require("./cost.f9800ae8.js")}),void 0),name:"\u8BBE\u7F6E\u6210\u672C\u4EF7"},{path:"/setting",component:()=>e(()=>Promise.resolve().then(function(){return require("./index.237cad89.js")}),void 0),name:"\u5E94\u7528\u8BBE\u7F6E",children:[{path:"",redirect:"/setting/general"},{path:"general",component:()=>e(()=>Promise.resolve().then(function(){return require("./general.2002cfc8.js")}),void 0),name:"\u901A\u7528"},{path:"keys",component:()=>e(()=>Promise.resolve().then(function(){return require("./keys.505ff2c4.js")}),void 0),name:"\u5FEB\u6377\u952E"},{path:"help",component:()=>e(()=>Promise.resolve().then(function(){return require("./help.6918a8a6.js")}),void 0),name:"\u5E2E\u52A9"},{path:"doctor",component:()=>e(()=>Promise.resolve().then(function(){return require("./doctor.63ab51ad.js")}),void 0),name:"\u7F51\u7EDC\u8BCA\u65AD"},{path:"proxy",component:()=>e(()=>Promise.resolve().then(function(){return require("./proxy.6fd7dbf1.js")}),void 0),name:"\u4EE3\u7406\u8BBE\u7F6E"},{path:"groups",component:()=>e(()=>Promise.resolve().then(function(){return require("./groups.48d0000a.js")}),void 0),name:"\u5206\u7EC4"}]}]}),_=t.createApp(h);
for(const[u,n]of Object.entries(f.ElementPlusIconsVue))_.component(u,n);
_.use(d.installer,{size:"small",zIndex:300}).use(P).mount("#app").$nextTick(window.removeLoading);

