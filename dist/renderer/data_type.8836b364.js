"use strict";
const e=[{name:"\u73B0\u4EF7",value:0,key:"price"},{name:"\u6628\u6536",value:1,key:"preClose"},{name:"\u4ECA\u5F00",value:2,key:"open"},{name:"\u6210\u4EA4\u91CF",value:3,key:"volume"},{name:"\u6210\u4EA4\u989D",value:4,key:"amount"},{name:"\u6362\u624B\u7387",value:5,key:"swap"},{name:"\u59D4\u6BD4",value:6,key:"abr"},{name:"\u603B\u76C8\u4E8F",value:7,key:"pro_t"},{name:"\u5F53\u65E5\u76C8\u4E8F",value:8,key:"pro_d"},{name:"\u6DA8\u8DCC\u5E45",value:9,key:"per",sor:!0},{name:"\u6700\u9AD8",value:10,key:"dayMax"},{name:"\u6700\u4F4E",value:11,key:"dayMin"},{name:"\u4E70\u4E00",value:12,key:"buy1Vo"},{name:"\u5356\u4E00",value:13,key:"sell1Vo"},{name:"\u6210\u672C\u4EF7",value:14,key:"cost"}];
var n={allDataTypes(){return e},getTyepByValue(a){for(let l in e){let u=e[l];
if(u.value==a)return u}return null}};
exports.DataType=n;

