"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const redis_1 = require("redis");
const readline = __importStar(require("readline"));
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
            yield page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/110.0.0.0 Mobile/15E148 Safari/604.1');
            yield page.setDefaultNavigationTimeout(0);
            yield page.goto(url, { waitUntil: 'networkidle2' }); // waits until page is fully loaded
            yield (0, helpers_1.delay)(1000, 2000); // emulates human behavior
            const statusCode = yield page.waitForResponse((response) => {
                return response.status();
            });
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
                // cookies
                const cookies = yield page.cookies();
                (0, helpers_1.storeData)(client, url, 'cookies', new Set(Array.from(cookies).map(c => JSON.stringify(c))));
                // certifications
                (0, helpers_1.storeData)(client, url, 'certs', (0, helpers_1.searchContent)('certs', content));
                // sustainability count (count num keywords / buzzwords)
                (0, helpers_1.storeData)(client, url, 'keywords', (0, helpers_1.searchContent)('keywords', content));
                // categories
                if ((0, helpers_1.isCollectionLink)(url)) {
                    categories.add(url);
                }
                (0, helpers_1.storeData)(client, url, 'categories', categories);
                // sizes
                // store set of sizes seen on site (unique)
                // prices
                // can calculate average price
            }
            yield browser.close();
        }
        catch (e) {
            console.log(e);
        }
    });
}
let question = () => __awaiter(void 0, void 0, void 0, function* () {
    var seed = "";
    yield rl.question("URL: ", (answer) => {
        rl.close();
        seed = answer;
        return;
    });
    return seed;
});
let run = () => __awaiter(void 0, void 0, void 0, function* () {
    // get user input for seed URL
    const seed = yield question();
    var seeds = new Set; // new Set(sites); use sites array from siteData.ts fill  
    seeds.add(seed); // just one seed URL right now
    yield client.connect(); // connect to Redis server
    let start = new Date().getTime(); // start timer
    for (const seedURL of seeds) {
        queue.push(seedURL);
        while (queue.length != 0) {
            let url = queue.pop(); // remove next url from queue
            if (url != undefined) {
                yield main(url);
            }
            //console.log(seen);
            console.log(seen.size);
            //console.log(categories);
            console.log(((new Date().getTime() - start) / 1000).toString() + ' seconds');
        }
        yield (0, helpers_1.storeNumPages)(client, seedURL, seen); // stores number of pages for url
        seen.clear(); // seen is empty for next seedURL
    }
    let end = new Date().getTime(); // stop timer
    let totalSeconds = (end - start) / 1000; // calculate time   
    yield (0, helpers_1.storeTime)(client, seed, totalSeconds); // store time in Redis
    console.log('TOTAL: ' + (totalSeconds).toString() + ' seconds');
    yield client.disconnect(); // disconnect from Redis server
});
/**
 * EXECUTION BEGINS HERE
 */
const client = (0, redis_1.createClient)({ url: "redis://127.0.0.1:6379" });
client.on('error', (err) => console.log('Redis Client Error', err));
let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
var queue = new Array(); // links to visit next
var seen = new Set(); // unique seen links
var shaKeys = new Set(); // SHA keys for exact similarity detection
// data collection sets
var categories = new Set; // one set for an entire domain
run();
