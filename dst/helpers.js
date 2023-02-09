"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = exports.getAbbr = void 0;
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
function getCategories(url) {
    return url;
}
exports.getCategories = getCategories;
