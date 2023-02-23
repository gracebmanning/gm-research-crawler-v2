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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const redis_1 = require("redis");
const helpers_1 = require("./helpers");
/**
 * FUNCTION DEFINITIONS
 */
function delay(min, max) {
    return new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min) + min)));
}
function storeCookies(cookiesList, urlAsString) {
    return __awaiter(this, void 0, void 0, function* () {
        const cookies = new Set(Array.from(cookiesList).map(c => JSON.stringify(c)));
        let abbr = (0, helpers_1.getAbbr)(urlAsString);
        yield client.HSET(urlAsString, 'cookies', abbr + 'cookies'); // store reference to set of cookies
        yield client.HSET(urlAsString, 'numCookies', abbr + 'numCookies'); // store reference to numCookies
        // create set of cookies
        for (let c of cookies) {
            yield client.SADD(abbr + 'cookies', c);
        }
        // store numCookies
        yield client.SET(abbr + 'numCookies', cookies.size.toString());
    });
}
function storeCertifications(content) {
    return __awaiter(this, void 0, void 0, function* () {
        var count = (0, helpers_1.countCertifications)(content);
        // store in Redis
    });
}
function main(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const browser = yield puppeteer_1.default.launch({ headless: true });
            const page = yield browser.newPage();
            yield page.setUserAgent('Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0');
            yield page.goto(url, { waitUntil: 'networkidle2' }); // waits until page is fully loaded
            yield delay(1000, 2000); // emulates human behavior
            const links = yield page.evaluate(() => {
                const anchors = document.getElementsByTagName('a');
                return Array.from(anchors).map(a => a.href);
            });
            // add URL to visited
            seen.add(url);
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
            storeCookies(cookies, url);
            // certifications
            const content = yield page.content();
            storeCertifications(content);
            // count certifications
            // store set of certs & numCerts
            // sustainability count
            // count num keywords / buzzwords
            // categories
            // store set of unique categories
            // sizes
            // store set of sizes seen on size (unique)
            // count num sizes
            // pages
            // count number of pages found within the domain
            // (use counter variable / set of unique seen links)
            yield browser.close();
        }
        catch (e) {
            console.log(e);
        }
    });
}
let run = () => __awaiter(void 0, void 0, void 0, function* () {
    yield client.connect(); // connect to Redis server
    for (const seedURL of seeds) {
        queue.push(seedURL);
        while (queue.length != 0) {
            let url = queue.pop(); // remove next url from queue
            if (url != undefined) {
                yield main(url);
            }
            console.log(queue);
        }
    }
    yield client.disconnect(); // disconnect from Redis server
});
/**
 * EXECUTION BEGINS HERE
 */
const client = (0, redis_1.createClient)({ url: "redis://127.0.0.1:6379" });
client.on('error', (err) => console.log('Redis Client Error', err));
var seeds = new Set(); // var seeds = new Set(sites); ...use sites array from siteData.ts file              
seeds.add('https://us.shein.com/'); // just one seed URL right now
var queue = new Array(); // links to visit next
var seen = new Set(); // unique seen links
run();
