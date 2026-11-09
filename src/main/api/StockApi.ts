/**
 * 行情数据 API 层。
 *
 * 负责与腾讯、新浪两大「开放式」行情接口通信，把交易所返回的原始文本/JSON
 * 解析成内部统一的 Stock / Sug 结构。这是整个应用的「数据源」，不依赖任何
 * 付费行情服务，直接抓取公开网页接口（因此也受这些接口的可用性/限流制约）。
 *
 * 数据源分工：
 *   - 腾讯（web.sqt.gtimg.cn / smartbox.gtimg.cn / ifzq.gtimg.cn）：A股/港股/美股/基金、
 *     搜索联想、分时、日K、分钟K 的主力来源
 *   - 新浪（hq.sinajs.cn / suggest3.sinajs.cn）：期货/股指期货/外汇/转债/三板 这类
 *     腾讯不覆盖的品种（见 getSinaStocks/getSinaSugs）
 *
 * 编码处理：两个站点的接口返回都是 GBK/GB18030 编码，因此用 iconv-lite 解码。
 * 注意：这里全局关闭了 axios 的 HTTPS 证书校验（rejectUnauthorized:false），
 * 属于已知安全风险（README 有记录）。
 */
import axios from "axios";
import iconv from 'iconv-lite';
import logger from "../service/logger";
import https from "https";
import local_store from "../storage/local_store";
var HttpsProxyAgent = require('https-proxy-agent');

// 全局 axios 默认：3 秒超时 + 关闭证书校验
axios.defaults.timeout = 3000;
axios.defaults.httpsAgent = new https.Agent({
    rejectUnauthorized:false,
});

// marketCode -> 中文市场名 的映射，用于搜索联想结果的 market 字段展示
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

/**
 * 自选股「条目」数据结构（一条被关注的标的）。
 *
 * key 是唯一标识，规则为 marketCode + code，例如：
 *   A股平安银行 = "sz000001"（sz 深市 / sh 沪市）
 *   港股        = "hk00700"、美股 = "usAAPL"（美股 code 形如 "AAPL.OQ"）
 *   期货/外汇等新浪系品种 key 规则不同（如 "nf_PTA"、"fx_sUSDCNH"），见 getSinaSugs。
 */
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

/**
 * 一条股票行情快照（由 parseLine/parseSinaLine 解析得到）。
 *
 * 字段含义（金额单位视市场而定，A股为元、volume 统一换算为「股」）：
 *   preClose=昨收, open=今开, volume=成交量, amount=成交额,
 *   swap=换手率, abr=振幅, per=涨跌幅(已换算为小数, 如 0.023=2.3%),
 *   dayMax/dayMin=最高/最低, buy1Vo/sell1Vo=买一/卖一委托量,
 *   timeStr=行情时间戳。
 * 额外的 cost/dayProfite/totalPro/totalProPer 由 stock.ts 的 processData 动态补充。
 */
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

/**
 * 解析新浪行情接口返回的一行文本为 Stock。
 *
 * 返回格式形如 `var hq_str_nf_TA0="PTA,昨结,今开,...";`：
 *   - tks[0] 里 hq_str_ 之后的是「请求时的 key」
 *   - tks[1] 是双引号内的逗号分隔字段，末尾有 `";` 两个字符需掐掉
 *
 * 不同市场（转债 zz / 期货 qh / 股指期货 gzqh / 外汇 wh）字段位置完全不一样，
 * 所以下面按 sug.marketCode 分支，各自从 datas 的特定下标取值。
 */
function parseSinaLine(line: string,sug: Sug): Stock{
    var stock = new Stock();

    let tks = line.split("=\"");
    let key = tks[0].split("hq_str_")[1];   // 从 "hq_str_XXX" 取出 XXX
    let tmp = tks[1];
    let txt = tmp.substring(0,tmp.length-2); // 掐掉结尾的 双引号+分号 两个字符（"和;）

    let datas = txt.split(",");

    // console.log(datas);

    stock.key = key;
    stock.code = sug.code;
    stock.name = datas[0];

    // 转债：新浪转债字段序列（0名称 1今开 2昨收 3现价 8成交量 9成交额 30时间）
    if(sug.marketCode=="zz"){
        stock.price = parseFloat(datas[3]);
        stock.open = parseFloat(datas[1]);
        stock.preClose = parseFloat(datas[2]);
        stock.per = (stock.price-stock.preClose)/stock.preClose;
        stock.volume = parseFloat(datas[8]);
        stock.amount = parseFloat(datas[9]);
        stock.timeStr = datas[30];
    // 期货：字段序列（0名称 2今开 8最新价 10昨结算 14成交量 17时间）
    }else if(sug.marketCode=="qh"){
        stock.price = parseFloat(datas[8]);
        stock.open = parseFloat(datas[2]);
        stock.preClose = parseFloat(datas[10]);
        stock.per = (stock.price-stock.preClose)/stock.preClose;
        stock.volume = parseFloat(datas[14]);
        stock.timeStr = datas[17];
        // stock.amount = parseFloat(datas[9]);
    // 股指期货：字段序列（0今开 3最新价 4成交量 14昨结算 36时间），名称在最后一列
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
    // 外汇：字段序列（1最新价 3昨收 5今开 6最高 7最低 9名称 17时间）
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

/**
 * 解析腾讯行情接口返回的一行文本为 Stock。
 *
 * 返回格式形如 `v_sz000001="1~平安银行~000001~现价~昨收~今开~成交量(手)~...";`：
 *   - tks[0] 是 "v_<marketCode><code>"，去掉 "v_" 即得到 key（港股接口前缀带 "r_"）
 *   - tks[1] 是按 "~" 分割的字段数组，下标含义固定（见下方注释）
 */
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

    // 基金（key 以 "jj" 开头）：字段结构更简单，只有 名称/现价/昨收 等
    if (stock.key?.startsWith("jj")) {
        // console.log(datas);
        stock.name = datas[1];
        stock.price = parseFloat(datas[2]);
        stock.preClose = parseFloat(datas[5]);
        stock.per = (stock.price-stock.preClose)/stock.preClose;
    } else {
        // 股票常规字段（下标为腾讯接口固定约定）：
        // 1名称 3现价 4昨收 5今开 6成交量(手) 10买一 20卖一
        // 30时间 32涨跌% 33最高 34最低 38换手% 57成交额 74振幅%
        stock.name = datas[1];
        stock.price = parseFloat(datas[3]);
        stock.preClose = parseFloat(datas[4]);
        stock.open = parseFloat(datas[5]);
        stock.buy1Vo = parseFloat(datas[10]);
        stock.sell1Vo = parseFloat(datas[20]);
        stock.per = parseFloat(datas[32]) / 100;          // 接口返回百分数（如 2.30），除 100 转小数
        stock.dayMax = parseFloat(datas[33]);
        stock.dayMin = parseFloat(datas[34]);
        stock.volume = parseFloat(datas[6]) * 100;        // 接口单位是「手」，乘 100 转「股」
        stock.amount = parseFloat(datas[57]) * 10000;     // 成交额接口单位为「万元」，乘 10000 转「元」
        stock.swap = parseFloat(datas[38]) / 100;         // 换手率百分数转小数
        if (datas.length > 74) {
            stock.abr = parseFloat(datas[74]) / 100;      // 振幅百分数转小数
        }
    }

    stock.timeStr = datas[30];

    return stock;
}

/**
 * 解析腾讯「分时」接口返回的数据，得到分时价点序列。
 * 每个 point 形如 {time: "YYYY-MM-DDTHH:MM00", price: number}，用于渲染分时曲线。
 */
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

/**
 * 把一根 K 线数组（腾讯 K 线接口的单条记录）转成对象。
 * d 结构：['日期', 开, 收, 最高, 最低, 成交量(手), ...]
 */
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

// 单条日K的原始数组示例（注释保留以便理解字段位置）
//(10) ['2022-08-31', '20.38', '20.37', '21.09', '20.29', '541893.00', {…}, '3.45', '111797.35', '']
/**
 * 解析腾讯「日K」接口返回的数据。优先取前复权(qfqday)，没有则退回不复权(day)。
 * 日期只保留「MM-DD」部分（去掉了年份），供图表 X 轴使用。
 */
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

/**
 * 解析腾讯「分钟K」接口返回的数据（type 可为 m5/m15/m30/m60 等）。
 * 与日K不同，分钟K的日期格式是 "YYYYMMDDHHMM"，这里把它拆成 "MM-DD:HH:MM"。
 */
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

    /**
     * 批量拉取腾讯实时行情（核心接口）。
     *
     * 流程：
     *   1. 过滤掉「新浪专属」品种（extra 以 "sina_" 开头且不是 sina_bj，它们走 getSinaStocks）
     *   2. 按市场拼接 URL：美股取 code 的 `.` 前段并大写（usAAPL）、港股加 "r_" 前缀、
     *      其余直接 marketCode+code，逗号连接多只股票
     *   3. `_=` 时间戳防止接口缓存
     *   4. 数组缓冲接收 + iconv GBK 解码，按 `;` 拆行逐行 parseLine
     *   5. 返回以 key 为索引的 stockData 映射（key 用 sug.key 覆盖，保证与本地 self 选股一致）
     *
     * proxy 参数历史上用于是否走代理，但当前实现未使用，恒传 false。
     */
    async getStocks(sugs: Sug[],proxy: boolean): Promise<any> {
        let oldSugs : Sug[] = sugs;

        sugs = [];

        var url = "https://web.sqt.gtimg.cn/q=";
        for (let i in oldSugs) {
            let s = oldSugs[i];
            // 新浪系品种交给 getSinaStocks，腾讯接口查不到
            if(s.extra?.startsWith("sina_") && s.extra!=='sina_bj'){
                continue;
            }

            sugs.push(s);

            if (s.marketCode == "us") {
                // 美股 code 形如 "AAPL.OQ"，去掉 .OQ 后缀并大写
                url = url + s.marketCode + s.code?.split(".")[0].toUpperCase() + ",";
            }else if(s.marketCode == "hk"){
                // 港股在腾讯实时接口需加 "r_" 前缀（"r_hk00700"）
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
    
            // 腾讯行情接口是 GBK 编码，必须用 iconv 解码（不能用默认 utf8）
            let t = iconv.decode(res.data, "gbk");

            let stockData: any = {}
    
            var lines = t.split(";");
            let index = 0;
            for (let i in lines) {
                let line = lines[i].trim();
                // 关键：接口返回的「行」顺序未必与请求顺序一致，
                // 需要根据每行开头的 "v_<marketCode><code>" 反查出它对应哪条 sug
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
                        // 用本地 sug 的 key/marketCode/extra 覆盖解析结果，保证 key 幂等一致
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

    /**
     * 腾讯「搜索联想」接口：输入关键字返回匹配的股票/基金候选（添加股票用）。
     * 返回的 name 是 unicode 转义（\uXXXX），需要解码成真实中文。
     */
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

        // 返回格式 "v_hint=\"候选1^候选2^...\";"，掐头去尾后按 "^" 分割
        var t = res.data;
        t = t.substring(8, t.length - 1);
        var lines = t.split("^");
        if (lines.length < 1) {
            return sugs;
        }
        for (let i in lines) {
            var l = lines[i];
            var sug = new Sug('code', 'xx');

            // 每个候选用 "~" 分割：marketCode~code~name~?~extra
            var tks = l.split("~");
            if(tks.length<2){
                continue;
            }
            let mkt = tks[0];

            sug.marketCode = mkt;
            sug.market = marketMap.get(mkt);
            sug.code = tks[1];
            sug.key = sug.marketCode! + sug.code!;
            // 名称是 \uXXXX 转义，逐个还原为真实字符
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

    /**
     * 新浪「搜索联想」接口：补充腾讯不覆盖的品种（期货/股指期货/外汇/转债/三板）。
     * 返回也是分号分隔文本，但每行用逗号分隔，且字段位置与腾讯完全不同，
     * 需要按 tks[1]（新浪内部类型码）映射回我们的 marketCode。
     */
    async getSinaSugs(key: string): Promise<Sug[]>{
        let now = new Date().getTime()
        // type 指定要搜索的品种集合：81=转债? 85/87=商品期货 88=股指期货 71=外汇 11=北交所
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
            // 每行：tks[1]=新浪类型码，tks[2]=代码，tks[3]=前缀代码，tks[4]=名称

            let marketCode = null;
            let key = null;
            if(tks[1]=='81'&&tks[4].endsWith("转债")){
                // 81 且名称以「转债」结尾 → 转债
                // console.log(tks);
                marketCode = "zz";
                key = tks[3];
            }else if(tks[1]=='87'||tks[1]=='85'){
                // 商品期货（国内），新浪 key 前缀 nf_
                marketCode = "qh";
                key = "nf_"+tks[2].toUpperCase()
            }else if(tks[1]=='88'){
                // 股指期货，前缀同样 nf_
                marketCode = "gzqh";
                key = "nf_"+tks[2].toUpperCase()
            }else if(tks[1]=='71'){
                // 外汇，前缀 fx_s
                marketCode = "wh";
                key = "fx_s"+tks[2];
            } else if (tks[1] == '11'&&tks[3].startsWith('bj')) {
                // 北交所（三板相关），key 前缀 bj
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
                sug.extra = "sina_"+marketCode;   // 标记为新浪系，后续行情走 getSinaStocks
                sug.key = key;
                
                sugs.push(sug);
            }
        }

        return sugs;
    },

    /**
     * 批量拉取新浪行情（期货/股指期货/外汇/转债等新浪专属品种）。
     * hq.sinajs.cn 需要在 Referer 带 finance.sina.com.cn 才返回数据，
     * 并且 URL 用原名（hq_str_nf_XXX 等）拼接；返回每行是 "var hq_str_XXX=..."。
     */
    async getSinaStocks(sugs: Sug[]): Promise<any>{
        let now = new Date().getTime()
        var url = "https://hq.sinajs.cn/etag.php?_="+now+"&list=";

        let sinaSugs:Sug[] = [];

        // 只挑出 extra 标记为 sina_zz / sina_qh / sina_gzqh / sina_wh 的品种
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
                // 新浪返回顺序与请求一致，直接用 index 对应（与腾讯接口不同，无需 find 反查）
                let sug = sinaSugs[index];
                let s = parseSinaLine(line,sug);
                s.index = index;
                // console.log(JSON.stringify(sug));
                index++;

                // 用 key 里是否包含解析出的 code 做一次校验，避免错位
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

    /**
     * 拉取某支股票的分时数据，并补充显示名称（优先别名 alias，其次配置里的 name）。
     */
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

    /**
     * 拉取某支股票的日K（前复权，最多 180 根）。
     */
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

    /**
     * 拉取某支股票的分钟K（type 如 m5/m15/m30/m60），最多 180 根。
     */
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

    /**
     * 应用 HTTP(S) 代理：不带用户名密码时用裸 host:port，否则用 user:pass@host:port。
     * 代理是否启用由 SetUpProxy（index.ts）根据配置 proxySwitch 决定。
     */
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
    /**
     * 清空代理，恢复默认直连（仍是关闭证书校验的 https.Agent）。
     */
    cleanProxy(){
        axios.defaults.httpsAgent = new https.Agent({
            rejectUnauthorized:false,
        });
        axios.defaults.proxy = false;
    },

}