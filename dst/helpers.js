"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeTime = exports.storeNumPages = exports.storeData = exports.isCollectionLink = exports.getCategories = exports.searchContent = exports.exactSimilarity = exports.validLinks = exports.getUrlBase = exports.getAbbr = exports.delay = void 0;
const siteData_1 = require("./siteData");
const node_crypto_1 = require("node:crypto");
var JSSoup = require('jssoup').default;
function delay(min, max) {
    return new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min) + min)));
}
exports.delay = delay;
function getAbbr(url) {
    let result = siteData_1.abbreviations.get(url);
    if (typeof (result) == "string") {
        return result;
    }
    else {
        return "";
    }
}
exports.getAbbr = getAbbr;
function getUrlBase(url) {
    let urlObj = new URL(url);
    return urlObj.protocol + "//" + urlObj.hostname;
}
exports.getUrlBase = getUrlBase;
// returns array of links with same domain name as url
function validLinks(url, links) {
    var valid = [];
    let domain = new URL(url).hostname;
    links.forEach((l) => {
        if (l != '' && new URL(l).hostname == domain) {
            let result = l.replace(/#[a-zA-Z]*/gm, ""); // remove # at end of URL
            // remove slash at end of URL
            if (result.slice(-1) == "/") {
                result = result.substring(0, result.length - 1);
            }
            // remove exclamation points at end of URL
            while (result.slice(-1) == "!") {
                result = result.substring(0, result.length - 1);
            }
            // remove "-copy-copy-copy" from fashion nova pages
            if (result.indexOf('-copy') != -1) {
                result = result.substring(0, result.indexOf('-copy'));
            }
            // check if from another country (igirl)
            if (new URL(l).hostname == 'igirlworld.com') {
                if (!(result.includes('/zh') || result.includes('/es'))) {
                    valid.push(result);
                }
            }
            else if (new URL(l).hostname == 'www2.hm.com') {
                // remove "-content-content-content" from H&M pages
                if (result.indexOf('-content') != -1) {
                    result = result.substring(0, result.indexOf('-content'));
                }
                if (result.includes('/en_us/')) {
                    valid.push(result);
                }
            }
            else {
                valid.push(result);
            }
        }
    });
    return valid;
}
exports.validLinks = validLinks;
function exactSimilarity(keys, content) {
    var body = new JSSoup(content).find('body').text; // get body content as string
    const hash = (0, node_crypto_1.createHash)('sha1');
    hash.update(body);
    const key = hash.digest('hex');
    if (keys.has(key)) {
        return true;
    }
    else {
        keys.add(key);
        return false;
    }
}
exports.exactSimilarity = exactSimilarity;
// used for collecting certifications and keywords
function searchContent(type, content) {
    var _a;
    let regex = (type == "certs") ? siteData_1.certsRegExp : siteData_1.keywordsRegExp;
    let matches = (_a = content.match(regex)) === null || _a === void 0 ? void 0 : _a.map(c => c.toLowerCase());
    return new Set(matches);
}
exports.searchContent = searchContent;
function getCategories(document, url) {
    const categories = new Set;
    if (url == 'https://chnge.com') {
        // <div class='menu-grid'> list of <a>Category Name</a> elements </div>
        var divElement = document.getElementsByClassName('menu-grid')[0];
        Array.from(divElement.getElementsByTagName('a')).forEach((a) => {
            categories.add(a.innerText);
        });
    }
    return categories;
}
exports.getCategories = getCategories;
function isCollectionLink(url) {
    // TODO: Shein, H&M, PLT
    let urlObj = new URL(url);
    let hostsWithCollections = new Set(['chnge.com', 'bigbudpress.com', 'www.fashionnova.com', 'www.fashionbrandcompany.com', 'shoptunnelvision.com', 'igirlworld.com']);
    let hostsWithCategory = new Set(['www.forever21.com']);
    if (hostsWithCollections.has(urlObj.hostname)) {
        if (url.replace(/https:\/\/[a-z].*\/collections\/[\w\d-]+/gm, "").length == 0) {
            return true;
        }
    }
    else if (hostsWithCategory.has(urlObj.hostname)) {
        if (url.includes('/category/')) {
            return true;
        }
    }
    else if (urlObj.hostname == 'us.shein.com') {
        // no pattern
    }
    else if (urlObj.hostname == 'www2.hm.com') {
        // .../en_us/category/sub-category
        // count the sub-categories?
    }
    else if (urlObj.hostname == 'www.prettylittlething.us') {
        // use /shop-by/ and /clothing/ ?
    }
    return false;
}
exports.isCollectionLink = isCollectionLink;
// type = cookies, certs, keywords
function storeData(untypedClient, urlAsString, type, dataset) {
    return __awaiter(this, void 0, void 0, function* () {
        let client = untypedClient;
        let urlBase = getUrlBase(urlAsString);
        let abbr = getAbbr(urlBase);
        var data = dataset;
        // store in Redis
        // create set of data
        for (let d of data) {
            yield client.SADD(abbr + type, d);
        }
        // store numData
        yield client.SET(abbr + 'num' + type, data.size.toString());
    });
}
exports.storeData = storeData;
function storeNumPages(untypedClient, urlAsString, dataset) {
    return __awaiter(this, void 0, void 0, function* () {
        let client = untypedClient;
        let urlBase = getUrlBase(urlAsString);
        let abbr = getAbbr(urlBase);
        var data = dataset;
        // store numpages
        yield client.SET(abbr + 'numpages', data.size.toString());
    });
}
exports.storeNumPages = storeNumPages;
function storeTime(untypedClient, urlAsString, time) {
    return __awaiter(this, void 0, void 0, function* () {
        let client = untypedClient;
        let urlBase = getUrlBase(urlAsString);
        let abbr = getAbbr(urlBase);
        // store time to crawl
        yield client.SET(abbr + 'time', time);
    });
}
exports.storeTime = storeTime;
/*

// used to set hash references for a url
async function setReferences(type:string, untypedClient:any, abbr:string, urlAsString:string){
    let client = <RedisClientType>untypedClient;
    // check if [type] key is already defined
    let key1 = await client.EXISTS(abbr+type);
    if(key1 == 0){
        console.log('calling HSET. urlAsString: ' + urlAsString + ', ' + abbr+type);
        await client.HSET(urlAsString, type, abbr+type); // store reference to set of cookies
    }
    // check if num[type] key is already defined
    let key2 = await client.EXISTS(abbr+'num'+type);
    if(key2 == 0){
        await client.HSET(urlAsString, 'num'+type, abbr+'num'+type); // store reference to numCookies
    }
}


export async function storeCookies(untypedClient:any, cookiesList:Protocol.Network.Cookie[], urlAsString:string){
    let client = <RedisClientType>untypedClient;
    let urlBase:string = getUrlBase(urlAsString);
    let abbr:string = getAbbr(urlBase);
    const cookies:Set<string> = new Set(Array.from(cookiesList).map(c => JSON.stringify(c)));

    setReferences('cookies', client, abbr, urlAsString);
    
    // store set of cookies
    for(let c of cookies){
        await client.SADD(abbr+'cookies', c);
    }

    // store numCookies
    await client.SET(abbr+'numcookies', cookies.size.toString());
}


export async function storeCertifications(untypedClient:any, content:string, urlAsString:string){
    let client = <RedisClientType>untypedClient;
    let urlBase:string = getUrlBase(urlAsString);
    let abbr:string = getAbbr(urlBase);
    var certs:Set<string> = searchContent('certs', content);

    setReferences('certs', client, abbr, urlAsString);

    // store in Redis
    // create set of certs
    for(let c of certs){
        await client.SADD(abbr+'certs', c);
    }

    // store numCerts
    await client.SET(abbr+'numcerts', certs.size.toString());
}

export async function storeKeywords(untypedClient:any, content:string, urlAsString:string){
    let client = <RedisClientType>untypedClient;
    let urlBase:string = getUrlBase(urlAsString);
    let abbr:string = getAbbr(urlBase);
    var keywords:Set<string> = searchContent('keywords', content);

    setReferences('keywords', client, abbr, urlAsString);

    // store in Redis
    // create set of keywords
    for(let k of keywords){
        await client.SADD(abbr+'keywords', k);
    }

    // store numKeywords
    await client.SET(abbr+'numkeywords', keywords.size.toString());
}

*/ 
