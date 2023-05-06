"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../helpers");
var result = (0, helpers_1.getUrlBase)("https://www.forever21.com/us/studentdiscount.html");
console.log(result);
var abbr = (0, helpers_1.getAbbr)(result);
console.log(abbr);
