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
const xmldom_1 = require("@xmldom/xmldom");
const helpers_1 = require("./helpers");
const xmlLinks = [
    './xml/f21-sitemap.xml',
    './xml/bbp-sitemap-pages.xml',
    './xml/bbp-sitemap-products.xml',
    './xml/bbp-sitemap-collections.xml',
    './xml/bbp-sitemap-blogs.xml',
    './xml/fn-sitemap-products-1.xml',
    './xml/sh-sitemap-products-1.xml'
];
// fsPromises.readFile(xmlLinks[6],'utf-8')
// .then(function(value){
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(value, "text/xml");
//     const links = doc.getElementsByTagName('url');
//     console.log(links.length);
// });
function main(url, isIndex) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('crawling:', url);
            const puppeteer = require('puppeteer-extra');
            const StealthPlugin = require('puppeteer-extra-plugin-stealth');
            puppeteer.use(StealthPlugin());
            const { executablePath } = require('puppeteer');
            const browser = yield puppeteer.launch({ headless: true, executablePath: executablePath() });
            const page = yield browser.newPage();
            yield page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/110.0.0.0 Mobile/15E148 Safari/604.1');
            yield page.setDefaultNavigationTimeout(0);
            yield page.goto(url, { waitUntil: 'networkidle2' }); // waits until page is fully loaded
            yield (0, helpers_1.delay)(1000, 2000); // emulates human behavior
            const content = yield page.content();
            const parser = new xmldom_1.DOMParser();
            const doc = parser.parseFromString(content, "text/xml");
            const locs = Array.from(doc.getElementsByTagName("loc"));
            // get XML links from index
            if (isIndex) {
                for (var i = 0; i < locs.length; i++) {
                    const locsElem = locs[i];
                    const nodes = Array.from(locsElem.childNodes);
                    for (let node of nodes) {
                        if (node.nodeValue != null) {
                            queue.push(node.nodeValue);
                        }
                    }
                }
                console.log(queue);
            }
            // count links on XML page
            else {
                let numLinks = locs.length;
                count += numLinks;
                console.log(count);
            }
            yield browser.close();
        }
        catch (e) {
            console.log(e);
        }
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        let isIndex = true;
        while (queue.length != 0) {
            // pop XML url from queue
            let nextURL = queue.pop();
            if (nextURL != undefined) {
                yield main(nextURL, isIndex);
            }
            isIndex = false;
        }
    });
}
let count = 0;
let queue = new Array;
queue.push('https://igirlworld.com/sitemap.xml'); // sitemap index
run();
/*
SITEMAP INDEXES

https://www.forever21.com/sitemap_index.xml
https://us.shein.com/sitemap-index.xml
https://www.fashionnova.com/sitemap.xml
https://www2.hm.com/en_us.sitemap.xml
https://www.prettylittlething.us/sitemaps/siteindex/siteindex_5.xml

https://bigbudpress.com/sitemap.xml
https://chnge.com/sitemap.xml
https://www.fashionbrandcompany.com/sitemap.xml
https://shoptunnelvision.com/sitemap.xml
https://igirlworld.com/sitemap.xml

<sitemap> for other sitemap files
<url> for links to count
*/ 
