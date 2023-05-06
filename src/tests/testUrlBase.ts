import { getAbbr, getUrlBase } from "../helpers";

var result = getUrlBase("https://www.forever21.com/us/studentdiscount.html");
console.log(result);

var abbr = getAbbr(result);
console.log(abbr);