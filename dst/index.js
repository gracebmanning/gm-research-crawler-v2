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
//import puppeteer from 'puppeteer';
//import puppeteer from 'puppeteer-extra-plugin-recaptcha';
const redis_1 = require("redis");
const helpers_1 = require("./helpers");
/**
 * FUNCTION DEFINITIONS
 */
function delay(min, max) {
    return new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min) + min)));
}
function main(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const puppeteer = require('puppeteer-extra');
            const StealthPlugin = require('puppeteer-extra-plugin-stealth');
            puppeteer.use(StealthPlugin());
            const { executablePath } = require('puppeteer');
            const browser = yield puppeteer.launch({ headless: true, executablePath: executablePath() });
            const page = yield browser.newPage();
            yield page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/110.0.0.0 Mobile/15E148 Safari/604.1');
            yield page.goto(url, { waitUntil: 'networkidle2' }); // waits until page is fully loaded
            yield delay(1000, 2000); // emulates human behavior
            // await page.solveRecaptchas();
            const links = yield page.evaluate(() => {
                const anchors = document.getElementsByTagName('a');
                return Array.from(anchors).map(a => a.href);
            });
            // add URL to seen links
            seen.add(url);
            // get valid links, add to queue (and seen set) if not seen 
            let valid = (0, helpers_1.validLinks)(url, links);
            valid.forEach((l) => {
                if (!seen.has(l)) {
                    queue.push(l);
                    seen.add(l);
                }
            });
            const content = yield page.content();
            // exact similarity detection
            const exact = (0, helpers_1.exactSimilarity)(shaKeys, content);
            if (!exact) {
                // cookies
                const cookies = yield page.cookies();
                (0, helpers_1.storeData)(client, url, 'cookies', new Set(Array.from(cookies).map(c => JSON.stringify(c))));
                // certifications
                (0, helpers_1.storeData)(client, url, 'certs', (0, helpers_1.searchContent)('certs', content));
                // sustainability count (count num keywords / buzzwords)
                (0, helpers_1.storeData)(client, url, 'keywords', (0, helpers_1.searchContent)('keywords', content));
                // categories
                // store set of unique categories
                // sizes
                // store set of sizes seen on size (unique)
                // count num sizes
                // pages
                // count number of pages found within the domain
                // (use counter variable / set of unique seen links)
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
    yield client.connect(); // connect to Redis server
    for (const seedURL of seeds) {
        queue.push(seedURL);
        while (queue.length != 0) {
            let url = queue.pop(); // remove next url from queue
            if (url != undefined) {
                yield main(url);
            }
            console.log(seen);
            console.log(new Date().getTime() - start);
        }
    }
    yield client.disconnect(); // disconnect from Redis server
    let end = new Date().getTime(); // stop timer
    // calculate time  
    console.log((end - start));
});
/**
 * EXECUTION BEGINS HERE
 */
const client = (0, redis_1.createClient)({ url: "redis://127.0.0.1:6379" });
client.on('error', (err) => console.log('Redis Client Error', err));
var seeds = new Set(); // var seeds = new Set(sites); ...use sites array from siteData.ts file              
seeds.add('https://chnge.com'); // just one seed URL right now
var queue = new Array(); // links to visit next
var seen = new Set(); // unique seen links
var shaKeys = new Set(); // SHA keys for exact similarity detection
run();
