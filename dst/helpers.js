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
exports.storeNumPages = exports.storeData = exports.getCategories = exports.searchContent = exports.exactSimilarity = exports.validLinks = exports.getUrlBase = exports.getAbbr = void 0;
const siteData_1 = require("./siteData");
const node_crypto_1 = require("node:crypto");
var JSSoup = require('jssoup').default;
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
            let result = l.replace(/#[a-zA-Z]*/gm, "");
            // remove slash at end of URL
            if (result.slice(-1) == "/") {
                result = result.substring(0, result.length - 1);
            }
            // remove exclamation points at end of URL
            while (result.slice(-1) == "!") {
                result = result.substring(0, result.length - 1);
            }
            valid.push(result);
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
function getCategories(url) {
    if (url == 'https://chnge.com') {
        // document.getElementsByClassName('menu-grid')[0]
    }
    // other sites
    return new Set();
}
exports.getCategories = getCategories;
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
        let key2 = yield client.EXISTS(abbr + 'numpages');
        if (key2 == 0) {
            yield client.HSET(urlAsString, 'numpages', abbr + 'numpages'); // store reference to numpages
        }
        // store numpages
        yield client.SET(abbr + 'numpages', data.size.toString());
    });
}
exports.storeNumPages = storeNumPages;
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
