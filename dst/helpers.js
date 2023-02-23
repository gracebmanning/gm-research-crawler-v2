"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countCertifications = exports.validLinks = exports.getAbbr = void 0;
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
// returns array of links with same domain name as url
function validLinks(url, links) {
    var valid = [];
    let domain = new URL(url).hostname;
    links.forEach((l) => {
        if (l != '' && new URL(l).hostname == domain) {
            valid.push(l);
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
