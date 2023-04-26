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
exports.storeData = exports.storeKeywords = exports.storeCertifications = exports.storeCookies = exports.searchContent = exports.exactSimilarity = exports.validLinks = exports.getUrlBase = exports.getAbbr = void 0;
const siteData_1 = require("./siteData");
const node_crypto_1 = require("node:crypto");
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
    const hash = (0, node_crypto_1.createHash)('sha1');
    hash.update(content);
    const key = hash.digest('hex');
    console.log(key);
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
// used to set hash references for a url
function setReferences(type, untypedClient, abbr, urlAsString) {
    return __awaiter(this, void 0, void 0, function* () {
        let client = untypedClient;
        // check if [type] key is already defined
        let key1 = yield client.EXISTS(abbr + type);
        if (key1 == 0) {
            yield client.HSET(urlAsString, type, abbr + type); // store reference to set of cookies
        }
        // check if num[type] key is already defined
        let key2 = yield client.EXISTS(abbr + 'num' + type);
        if (key2 == 0) {
            yield client.HSET(urlAsString, 'num' + type, abbr + 'num' + type); // store reference to numCookies
        }
    });
}
function storeCookies(untypedClient, cookiesList, urlAsString) {
    return __awaiter(this, void 0, void 0, function* () {
        let client = untypedClient;
        let urlBase = getUrlBase(urlAsString);
        let abbr = getAbbr(urlBase);
        const cookies = new Set(Array.from(cookiesList).map(c => JSON.stringify(c)));
        setReferences('cookies', client, abbr, urlAsString);
        // store set of cookies
        for (let c of cookies) {
            yield client.SADD(abbr + 'cookies', c);
        }
        // store numCookies
        yield client.SET(abbr + 'numcookies', cookies.size.toString());
    });
}
exports.storeCookies = storeCookies;
function storeCertifications(untypedClient, content, urlAsString) {
    return __awaiter(this, void 0, void 0, function* () {
        let client = untypedClient;
        let urlBase = getUrlBase(urlAsString);
        let abbr = getAbbr(urlBase);
        var certs = searchContent('certs', content);
        setReferences('certs', client, abbr, urlAsString);
        // store in Redis
        // create set of certs
        for (let c of certs) {
            yield client.SADD(abbr + 'certs', c);
        }
        // store numCerts
        yield client.SET(abbr + 'numcerts', certs.size.toString());
    });
}
exports.storeCertifications = storeCertifications;
function storeKeywords(untypedClient, content, urlAsString) {
    return __awaiter(this, void 0, void 0, function* () {
        let client = untypedClient;
        let urlBase = getUrlBase(urlAsString);
        let abbr = getAbbr(urlBase);
        var keywords = searchContent('keywords', content);
        setReferences('keywords', client, abbr, urlAsString);
        // store in Redis
        // create set of keywords
        for (let k of keywords) {
            yield client.SADD(abbr + 'keywords', k);
        }
        // store numKeywords
        yield client.SET(abbr + 'numkeywords', keywords.size.toString());
    });
}
exports.storeKeywords = storeKeywords;
// type = cookies, certs, keywords
function storeData(untypedClient, urlAsString, type, dataset) {
    return __awaiter(this, void 0, void 0, function* () {
        let client = untypedClient;
        let urlBase = getUrlBase(urlAsString);
        let abbr = getAbbr(urlBase);
        var data = dataset;
        setReferences(type, client, abbr, urlAsString);
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
