"use strict";
/*!
 * escape-html
 * Copyright(c) 2012-2013 TJ Holowaychuk
 * Copyright(c) 2015 Andreas Lubbe
 * Copyright(c) 2015 Tiancheng "Timothy" Gu
 * MIT Licensed
 */var i=/["'&<>]/,l=u;function u(n){var a=""+n,c=i.exec(a);
    if(!c)return a;var t,s="",e=0,r=0;
    for(e=c.index;e<a.length;e++){switch(a.charCodeAt(e)){case 34:t="&quot;";break;case 38:t="&amp;";break;case 39:t="&#39;";break;case 60:t="&lt;";break;case 62:t="&gt;";break;default:continue}r!==e&&(s+=a.substring(r,e)),r=e+1,s+=t}return r!==e?s+a.substring(r,e):s}exports.escapeHtml_1=l;
