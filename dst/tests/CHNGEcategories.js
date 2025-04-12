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
const redis_1 = require("redis");
const helpers_1 = require("../helpers");
/**
 * FUNCTION DEFINITIONS
 */
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
            yield (0, helpers_1.delay)(1000, 2000); // emulates human behavior
            const divElement = yield page.evaluate((url) => {
                var result;
                // get categories
                if (url == 'https://chnge.com') {
                    // <div class='menu-grid'> list of <a>Category Name</a> elements </div>
                    result = document.getElementsByClassName('menu-grid')[0];
                    console.log(result);
                }
                else {
                    result = new HTMLDivElement();
                }
                return result;
            }, url);
            const categories = new Set;
            var tempArray = Array.from(divElement.getElementsByTagName('a')).map((a) => { a.innerText; });
            for (var e in tempArray) {
                categories.add(e);
            }
            console.log(categories);
            (0, helpers_1.storeData)(client, url, 'categories', categories);
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
            //console.log(categories);
            console.log(((new Date().getTime() - start) / 1000).toString() + ' seconds');
        }
    }
    yield client.disconnect(); // disconnect from Redis server
    let end = new Date().getTime(); // stop timer
    // calculate time  
    console.log('TOTAL: ' + ((end - start) / 1000).toString() + ' seconds');
});
/**
 * EXECUTION BEGINS HERE
 */
const client = (0, redis_1.createClient)({ url: "redis://127.0.0.1:6379" });
client.on('error', (err) => console.log('Redis Client Error', err));
var seeds = new Set; // new Set(sites); use sites array from siteData.ts file              
seeds.add('https://chnge.com'); // just one seed URL right now
var queue = new Array(); // links to visit next
var seen = new Set(); // unique seen links
// data collection sets
//var categories = new Set<string>; // one set for an entire domain
run();
