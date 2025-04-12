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
const helpers_1 = require("./helpers");
/**
 * FUNCTION DEFINITIONS
 */
function main(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('crawling:', url);
            const puppeteer = require('puppeteer-extra');
            const StealthPlugin = require('puppeteer-extra-plugin-stealth');
            puppeteer.use(StealthPlugin());
            const { executablePath } = require('puppeteer');
            const browser = yield puppeteer.launch({ headless: true, executablePath: executablePath() });
            const page = yield browser.newPage();
            yield page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1');
            yield page.setDefaultNavigationTimeout(0);
            yield page.goto(url, { waitUntil: 'networkidle2', timeout: 0 }); // waits until page is fully loaded
            yield (0, helpers_1.delay)(1000, 2000); // emulates human behavior
            const statusCode = yield page.waitForResponse((response) => {
                return response.status();
            });
            console.log(statusCode);
            if (statusCode == 404) {
                throw new Error('404 error');
            }
            const links = yield page.evaluate(() => {
                // get links
                const anchors = document.getElementsByTagName('a');
                return Array.from(anchors).map(a => a.href);
            });
            // add URL to seen links
            seen.add(url);
            // get valid links, add to queue (and seen set) if not seen 
            let valid = (0, helpers_1.validLinks)(url, links);
            let categories = new Set();
            valid.forEach((l) => {
                var link = new URL(l);
                var path = link.pathname;
                if (url == "https://www.forever21.com") {
                    if (path.includes("/us/shop/catalog/category/")) {
                        path = path.replace("/us/shop/catalog/category/", "");
                        var sections = path.split("/");
                        categories.add(sections[1]);
                    }
                }
                else if (url == "https://us.shein.com") {
                }
                else if (url == "https://www.fashionnova.com/collections") {
                    if (path.includes("/collections/")) {
                        categories.add(l);
                    }
                }
                else if (url == "https://www2.hm.com/en_us/index.html") {
                    path = path.replace("/en_us/", "");
                    path = path.replace(".html", "");
                    var sections = path.split("/");
                    var menuCategories = ["women", "men", "divided", "baby", "kids", "home", "beauty", "sport", "sale", "sustainability-at-hm"];
                    if (menuCategories.includes(sections[0])) {
                        if (!path.includes("our-commitment") && !path.includes("our-work") && !path.includes("secondhand")) {
                            categories.add(path);
                        }
                    }
                    console.log(path);
                }
                else if (url == "https://www.prettylittlething.us/site-map") {
                    if (path.includes("/shop-by/")) {
                        categories.add(l);
                    }
                }
            });
            console.log(categories);
            console.log(categories.size);
            yield browser.close();
        }
        catch (e) {
            console.log(e);
        }
    });
}
let run = () => __awaiter(void 0, void 0, void 0, function* () {
    let start = new Date().getTime(); // start timer
    let url = "https://www.prettylittlething.us/site-map";
    yield main(url);
    console.log(((new Date().getTime() - start) / 1000).toString() + ' seconds');
    let end = new Date().getTime(); // stop timer
    let totalSeconds = (end - start) / 1000; // calculate time   
    console.log('TOTAL: ' + (totalSeconds).toString() + ' seconds');
});
/**
 * EXECUTION BEGINS HERE
 */
var seen = new Set(); // unique seen links
run();
