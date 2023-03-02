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
exports.storeCookies = exports.countCertifications = exports.validLinks = exports.getUrlBase = exports.getAbbr = void 0;
const siteData_1 = require("./siteData");
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
            if (result.slice(-1) == "/") {
                result = result.substring(0, result.length - 1);
            }
            valid.push(result);
        }
    });
    return valid;
}
exports.validLinks = validLinks;
function countCertifications(content) {
    var count = (content.match(siteData_1.certsRegExp) || []).length;
    return count;
}
exports.countCertifications = countCertifications;
function storeCookies(untypedClient, cookiesList, urlAsString) {
    return __awaiter(this, void 0, void 0, function* () {
        let client = untypedClient;
        const cookies = new Set(Array.from(cookiesList).map(c => JSON.stringify(c)));
        let urlBase = getUrlBase(urlAsString);
        let abbr = getAbbr(urlBase);
        // check if cookies key is already defined
        let key1 = yield client.EXISTS(abbr + 'cookies');
        if (key1 == 0) {
            yield client.HSET(urlAsString, 'cookies', abbr + 'cookies'); // store reference to set of cookies
        }
        // check if numCookies key is already defined
        let key2 = yield client.EXISTS(abbr + 'numCookies');
        if (key2 == 0) {
            yield client.HSET(urlAsString, 'numCookies', abbr + 'numCookies'); // store reference to numCookies
        }
        // create set of cookies
        for (let c of cookies) {
            yield client.SADD(abbr + 'cookies', c);
        }
        // store numCookies
        yield client.SET(abbr + 'numCookies', cookies.size.toString());
    });
}
exports.storeCookies = storeCookies;
