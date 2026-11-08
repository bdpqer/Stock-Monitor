import axios from "axios";
import iconv from 'iconv-lite';
import logger from "../service/logger";
import https from "https";
import local_store from "../storage/local_store";
var HttpsProxyAgent = require('https-proxy-agent');

axios.defaults.timeout = 3000;
axios.defaults.httpsAgent = new https.Agent({
    rejectUnauthorized:false,
});

var marketMap = new Map();
marketMap.set("sh", "A股");
marketMap.set("jj", "基金");
marketMap.set("sz", "A股");
marketMap.set("hk", "港股");
marketMap.set("us", "美股");
marketMap.set("qh", "期货");
marketMap.set("gzqh", "股指期货");
marketMap.set("nq", "三板");
marketMap.set("zz", "转债");
marketMap.set("wh", "外汇");
marketMap.set("bj", "A股");

export class Sug {

    constructor(code: string, marketCode: string) {
        this.code = code;
        this.marketCode = marketCode;
        this.key = this.marketCode + this.code;
    }

    code: string | null | undefined;
    marketCode: string | null | undefined;
    market: string | null | undefined;
    name: string | null | undefined;
    extra: string | null | undefined;
    key: string | null | undefined;
    group: string | null | undefined;
}

export class Stock {
    index: number | null | undefined;
    code: string | null | undefined;
    name: string | null | undefined;
    key: string | null | undefined;
    price: number | null | undefined;
    preClose: number | null | undefined;
    open: number | null | undefined;
    volume: number | null | undefined;
    amount: number | null | undefined;
    swap: number | null | undefined;
    abr: number | null | undefined;
    per: number | null | undefined;
    dayMax: number | null | undefined;
    dayMin: number | null | undefined;
    buy1Vo: number | null | undefined;
    sell1Vo: number | null | undefined;

    timeStr: string | null | undefined;
    marketCode: string | null | undefined;
    extra: string | null | undefined;
}

function parseSinaLine(line: string,sug: Sug): Stock{
    var stock = new Stock();

    let tks = line.split("=\"");
    let key = tks[0].split("hq_str_")[1];
    let tmp = tks[1];
    let txt = tmp.substring(0,tmp.length-2);

    let datas = txt.split(",");

    // console.log(datas);

    stock.key = key;
    stock.code = sug.code;
    stock.name = datas[0];

    if(sug.marketCode=="zz"){
        stock.price = parseFloat(datas[3]);
        stock.open = parseFloat(datas[1]);
        stock.preClose = parseFloat(datas[2]);
        stock.per = (stock.price-stock.preClose)/stock.preClose;
        stock.volume = parseFloat(datas[8]);
        stock.amount = parseFloat(datas[9]);
        stock.timeStr = datas[30];
    }else if(sug.marketCode=="qh"){
        stock.price = parseFloat(datas[8]);
        stock.open = parseFloat(datas[2]);
        stock.preClose = parseFloat(datas[10]);
        stock.per = (stock.price-stock.preClose)/stock.preClose;
        stock.volume = parseFloat(datas[14]);
        stock.timeStr = datas[17];
        // stock.amount = parseFloat(datas[9]);
    }else if(sug.marketCode=="gzqh"){
        // console.log(line)
        stock.name = datas[datas.length-1];
        stock.price = parseFloat(datas[3]);
        stock.open = parseFloat(datas[0]);
        stock.preClose = parseFloat(datas[14]);
        stock.per = (stock.price-stock.preClose)/stock.preClose;
        stock.volume = parseFloat(datas[4]);
        stock.timeStr = datas[36];
        // stock.amount = parseFloat(datas[9]);
    }else if(sug.marketCode=="wh"){
        stock.name = datas[9];
        stock.price = parseFloat(datas[1]);
        stock.open = parseFloat(datas[5]);
        stock.preClose = parseFloat(datas[3]);
        stock.per = (stock.price-stock.preClose)/stock.preClose;
        stock.dayMax = parseFloat(datas[6]);
        stock.dayMin = parseFloat(datas[7]);
        stock.timeStr = datas[17];
    }
    
    // console.log(JSON.stringify(stock));

    return stock;
}

function parseLine(line: string,sug: Sug): Stock {
    var stock = new Stock();

    var tks = line.split("=\"");

    if(sug.marketCode=="hk"){
        stock.key = sug.key;
    }else{
        stock.key = tks[0].substring(2);
    }
    stock.code = stock.key;

    let datas = tks[1].split("~");
    // console.log(datas);

    if (stock.key?.startsWith("jj")) {
        // console.log(datas);
        stock.name = datas[1];
        stock.price = parseFloat(datas[2]);
        stock.preClose = parseFloat(datas[5]);
        stock.per = (stock.price-stock.preClose)/stock.preClose;
    } else {
        stock.name = datas[1];
        stock.price = parseFloat(datas[3]);
        stock.preClose = parseFloat(datas[4]);
        stock.open = parseFloat(datas[5]);
        stock.buy1Vo = parseFloat(datas[10]);
        stock.sell1Vo = parseFloat(datas[20]);
        stock.per = parseFloat(datas[32]) / 100;
        stock.dayMax = parseFloat(datas[33]);
        stock.dayMin = parseFloat(datas[34]);
        stock.volume = parseFloat(datas[6]) * 100;
        stock.amount = parseFloat(datas[57]) * 10000;
        stock.swap = parseFloat(datas[38]) / 100;
        if (datas.length > 74) {
            stock.abr = parseFloat(datas[74]) / 100;
        }
    }

    stock.timeStr = datas[30];

    return stock;
}

function parseFenShi(key:string,data:string){
    let fenshi:any = {};

    let points:any = [];
    let jo = JSON.parse(data.split("=")[1])
    let tmp = jo.data[key].data;
    let datas = tmp.data;
    let date = tmp.date;
    for(let i in datas){
        let one = datas[i];

        let tks = one.split(" ");

        let point:any = {};
        point.time = date+"T"+tks[0]+"00";
        // point.time = tks[0]+"00";
        point.price = parseFloat(tks[1]);

        points.push(point);
    }

    fenshi.points = points;

    return fenshi;
}

function parseK(d:any){
    let date = d[0];
    let open = d[1];
    let close = d[2];
    let max = d[3];
    let min = d[4];
    let vol = d[5];//成交量，手

    let the:any = {};
    the.max = parseFloat(max);
    the.min = parseFloat(min);
    the.date = date;
    the.open = parseFloat(open);
    the.close = parseFloat(close);
    the.vol = parseFloat(vol);

    return the;
}

//(10) ['2022-08-31', '20.38', '20.37', '21.09', '20.29', '541893.00', {…}, '3.45', '111797.35', '']
function parseDayk(key:string,data:string){
    let dayk:any = {};

    let points:any = [];

    let jo = JSON.parse(data.split("=")[1])
    if(jo.code!=0){
        return null;
    }
    let tmp = jo.data[key];
    let day = tmp.qfqday;
    if(day==undefined){
        day = tmp.day;
    }
    for(let i in day){
        let d = day[i];
        let o = parseK(d);
        o.date = o.date.substring(5);
        points.push(o);
    }

    dayk.points = points;

    return dayk;
}

function parseMk(key:string,data:string,type:string){
    let mk:any = {};

    let points:any = [];

    let jo = JSON.parse(data.split("=")[1])
    if(jo.code!=0){
        return null;
    }
    let tmp = jo.data[key];
    let ms = tmp[type];
    // console.log(jo);
    for(let i in ms){
        let d = ms[i];

        let o = parseK(d);
        let tmp = o.date.substring(4); 
        o.date = tmp.substring(0,4)+"-"+tmp.substring(4,6)+":"+tmp.substring(6,8);
        points.push(o);
    }

    mk.points = points;

    return mk;
}

export default {

    async getStocks(sugs: Sug[],proxy: boolean): Promise<any> {
        let oldSugs : Sug[] = sugs;

        sugs = [];

        var url = "https://web.sqt.gtimg.cn/q=";
        for (let i in oldSugs) {
            let s = oldSugs[i];
            if(s.extra?.startsWith("sina_") && s.extra!=='sina_bj'){
                continue;
            }

            sugs.push(s);

            if (s.marketCode == "us") {
                url = url + s.marketCode + s.code?.split(".")[0].toUpperCase() + ",";
            }else if(s.marketCode == "hk"){
                url = url +"r_"+ s.marketCode + s.code + ",";
            } else {
                url = url + s.marketCode + s.code + ",";
            }
        }

        url += ("&_=" + new Date().getTime());

        // console.log(url);

        try{
            let res = await axios.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
                    "Referer": "https://gu.qq.com/"
                },
                responseType: 'arraybuffer',
                responseEncoding: "binary",
            })
    
            let t = iconv.decode(res.data, "gbk");

            let stockData: any = {}
    
            var lines = t.split(";");
            let index = 0;
            for (let i in lines) {
                let line = lines[i].trim();
                let sug = sugs.find(j => {
                    let currCode = lines[i].split('=')[0].replaceAll('v_', '').trim()
                    let searchKey = ''
                    if (j.marketCode == "us") {
                        searchKey = j.marketCode + j.code?.split(".")[0].toUpperCase()
                    }else if(j.marketCode == "hk"){
                        searchKey = "r_"+ j.marketCode + j.code
                    } else {
                        searchKey = ""+j.marketCode + j.code
                    }
                    return  searchKey === currCode
                })||new Sug('', '');
                if (line.length > 0) {
                    // console.log(line);
                    let s = parseLine(line,sug);
                    s.index = index;
                    index++;
    
                    if (s.code && sug?.key) {
                        s.key = sug.key;
                        s.marketCode = sug.marketCode;
                        s.extra = sug.extra;
                        stockData[s.key] = s;
                    }else{
                        logger.log("get stock error:")
                        logger.log("sug:"+JSON.stringify(sug))
                        logger.log("stock:"+JSON.stringify(s))
                    }
                }
            }
    
            return stockData;
        }catch(err:any){
            logger.log(err+"")
            return null;
        }
    },

    async getSugs(key: string): Promise<Sug[]> {
        var p = { "v": 2, "q": key, "t": "all" };
        let res = await axios.get("https://smartbox.gtimg.cn/s3/", {
            params: p,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
                "Referer": "https://gu.qq.com/"
            },
        })

        var sugs: Sug[];
        sugs = [];

        var t = res.data;
        t = t.substring(8, t.length - 1);
        var lines = t.split("^");
        if (lines.length < 1) {
            return sugs;
        }
        for (let i in lines) {
            var l = lines[i];
            var sug = new Sug('code', 'xx');

            var tks = l.split("~");
            if(tks.length<2){
                continue;
            }
            let mkt = tks[0];

            sug.marketCode = mkt;
            sug.market = marketMap.get(mkt);
            sug.code = tks[1];
            sug.key = sug.marketCode! + sug.code!;
            let n = tks[2].match(/\\u([0-9A-Fa-f]{4})/g)
            let name = tks[2];
            for (let j in n) {
                let w = n[j];
                let hex = parseInt(w.substr(2), 16);
                let tmp = String.fromCharCode(hex);
                name = name.replace(w, tmp)
            }
            sug.name = name;
            sug.extra = tks[4];

            sugs.push(sug);
        }

        return sugs;
    },

    async getSinaSugs(key: string): Promise<Sug[]>{
        let now = new Date().getTime()
        var p = { "type": "81,85,86,88,71,11", "key": key, "name": "suggestdata_"+now};
        let res = await axios.get("https://suggest3.sinajs.cn/suggest/", {
            params: p,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
                "Referer": "https://finance.sina.com.cn/"
            },
            responseType:'arraybuffer',
            responseEncoding:"binary",
        });

        let data = iconv.decode(res.data,"gb18030");

        // console.log(data);

        var sugs: Sug[];
        sugs = [];

        let tmp = data.split("=\"")[1];
        let txt = tmp.substring(0,tmp.length-2);
        let lines = txt.split(";");
        for(let i in lines){
            let line = lines[i];
            // console.log(line);
            let tks = line.split(",");
            // console.log(tks);

            let marketCode = null;
            let key = null;
            if(tks[1]=='81'&&tks[4].endsWith("转债")){
                // console.log(tks);
                marketCode = "zz";
                key = tks[3];
            }else if(tks[1]=='87'||tks[1]=='85'){
                marketCode = "qh";
                key = "nf_"+tks[2].toUpperCase()
            }else if(tks[1]=='88'){
                marketCode = "gzqh";
                key = "nf_"+tks[2].toUpperCase()
            }else if(tks[1]=='71'){
                marketCode = "wh";
                key = "fx_s"+tks[2];
            } else if (tks[1] == '11'&&tks[3].startsWith('bj')) {
                marketCode = 'bj'
                key = "bj"+tks[2].toUpperCase()
            } else{
                console.log("not support market type.");
                console.log(tks);
            }

            if(marketCode!=null){
                var sug = new Sug(tks[2], marketCode);
                sug.market = marketMap.get(marketCode);
                sug.name = tks[4];
                sug.extra = "sina_"+marketCode;
                sug.key = key;
                
                sugs.push(sug);
            }
        }

        return sugs;
    },

    async getSinaStocks(sugs: Sug[]): Promise<any>{
        let now = new Date().getTime()
        var url = "https://hq.sinajs.cn/etag.php?_="+now+"&list=";

        let sinaSugs:Sug[] = [];

        for(let i in sugs){
            let s = sugs[i];
            if(s.extra == "sina_zz"){
                url += s.key + ",";
                sinaSugs.push(s);
            }else if(s.extra == "sina_qh"){
                url += s.key + ",";
                sinaSugs.push(s);
            }else if(s.extra == "sina_gzqh"){
                url += s.key + ",";
                sinaSugs.push(s);
            }else if(s.extra == "sina_wh"){
                url += s.key + ",";
                sinaSugs.push(s);
            }
        }

        // console.log(url);

        if(sinaSugs.length==0){
            return null;
        }

        try{
            let res = await axios.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
                    "Referer": "https://finance.sina.com.cn/"
                },
                responseType:'arraybuffer',
                responseEncoding:"binary",
            })
    
            let data = iconv.decode(res.data,"gb18030");

            // console.log(data);
            logger.log("新浪:----------------"+JSON.stringify(data))
            let stockData: any = {}

            let lines = data.trim().split(";");
            let index = 0;
            for(let i in lines){
                let line = lines[i];
                if(line.trim()==""){
                    continue;
                }
                // console.log(line);
                let sug = sinaSugs[index];
                let s = parseSinaLine(line,sug);
                s.index = index;
                // console.log(JSON.stringify(sug));
                index++;

                if (s.code && sug?.key?.toLowerCase().indexOf(s.code.toLowerCase()) != -1) {
                    if (sug?.key) {
                        s.key = sug.key;
                        s.marketCode = sug.marketCode;
                        stockData[s.key] = s;
                    }
                }
            }
    
            return stockData;
        }catch(err:any){
            logger.log(err+"")
            return null;
        }

    },

    async getFenShiData(key: string): Promise<any>{

        let url = "https://web.ifzq.gtimg.cn/appstock/app/minute/query?_var=min_data_"+key+"&code="+key+"&r="+Math.random();

        console.log(url);

        let res = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
                "Referer": "https://gu.qq.com/"
            },
        });

        // console.log(res);
        let fenshi:any =parseFenShi(key,res.data);

        let conf = local_store.config;
        fenshi.name = conf.alias[key];
        if(fenshi.name==undefined||fenshi.name==null||fenshi.name==""){
            for(let i in conf.keys){
                let s = conf.keys[i];
                if(s.key==key){
                    fenshi.name = s.name;
                    break;
                }
            }
        }

        return fenshi;
    },

    async getDaykData(key: string): Promise<any>{
        let url = "https://proxy.finance.qq.com/ifzqgtimg/appstock/app/newfqkline/get?_var=kline_dayqfq&param="+key+",day,,,180,qfq&r="+Math.random();

        console.log(url);

        let res = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
                "Referer": "https://gu.qq.com/"
            },
        });

        return parseDayk(key,res.data);
    },

    async getMkData(key: string,type:string): Promise<any>{
        let url = "https://ifzq.gtimg.cn/appstock/app/kline/mkline?param="+key+","+type+",,180&_var="+type+"_today&r="+Math.random();

        console.log(url);

        let res = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
                "Referer": "https://gu.qq.com/"
            },
        });

        return parseMk(key,res.data,type);
    },

    setProxy(host:string,port:number,un:string,pass:string){
        if(un==null||un==undefined){
            let agent = new HttpsProxyAgent("http://"+host+":"+port);
            agent.rejectUnauthorized = false;
            axios.defaults.httpsAgent = agent;
        }else{
            let agent = new HttpsProxyAgent("http://"+un+":"+pass+"@"+host+":"+port);
            agent.rejectUnauthorized = false;
            axios.defaults.httpsAgent = agent;
        }
    },
    cleanProxy(){
        axios.defaults.httpsAgent = new https.Agent({
            rejectUnauthorized:false,
        });
        axios.defaults.proxy = false;
    },

}