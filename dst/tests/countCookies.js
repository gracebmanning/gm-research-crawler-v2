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
const helpers_1 = require("../helpers");
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
            yield page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2 like Mac OS X) AppleWebKit/605.1.15 CriOS/110.0.0.0 Mobile/15E148 Safari/604.1');
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
            console.log("links: ", links);
            // add URL to seen links
            seen.add(url);
            const content = yield page.content();
            // exact similarity detection
            const exact = (0, helpers_1.exactSimilarity)(shaKeys, content);
            if (!exact) {
                // get valid links, add to queue (and seen set) if not seen 
                let valid = (0, helpers_1.validLinks)(url, links);
                valid.forEach((l) => {
                    if (!seen.has(l)) {
                        queue.push(l);
                        seen.add(l);
                    }
                });
                const cookies = yield page.cookies();
                const numCookies = new Set(Array.from(cookies).map(c => JSON.stringify(c))).size;
                console.log("cookies:", numCookies);
            }
            yield browser.close();
        }
        catch (e) {
            console.log(e);
        }
    });
}
let run = () => __awaiter(void 0, void 0, void 0, function* () {
    let start = new Date().getTime(); // start timer
    let url = seed;
    if (url != undefined) {
        yield main(url);
    }
    //console.log(categories);
    console.log(((new Date().getTime() - start) / 1000).toString() + ' seconds');
    seen.clear(); // seen is empty for next seedURL
    let end = new Date().getTime(); // stop timer
    let totalSeconds = (end - start) / 1000; // calculate time   
    console.log('TOTAL: ' + (totalSeconds).toString() + ' seconds');
});
/**
 * EXECUTION BEGINS HERE
 */
var seeds = new Set; // new Set(sites); use sites array from siteData.ts fill
var seed = "https://shoptunnelvision.com";
seeds.add(seed); // just one seed URL right now
var queue = new Array(); // links to visit next
var seen = new Set(); // unique seen links
var shaKeys = new Set(); // SHA keys for exact similarity detection
// data collection sets
var categories = new Set; // one set for an entire domain
run();
