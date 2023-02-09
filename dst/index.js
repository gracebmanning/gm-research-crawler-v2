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
function setData(url, key, value) {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.HSET(url, key, value);
    });
}
function storeCookies(cookiesList, urlAsString) {
    return __awaiter(this, void 0, void 0, function* () {
        const cookies = new Set(Array.from(cookiesList).map(c => JSON.stringify(c)));
        let abbr = (0, helpers_1.getAbbr)(urlAsString);
        setData(urlAsString, 'cookies', abbr + 'cookies'); // store set of cookies
        setData(urlAsString, 'numCookies', abbr + 'numCookies'); // store numCookies
        for (let c of cookies) {
            var result = yield client.SADD(abbr + 'cookies', c);
            console.log(result);
        }
        yield client.SET(abbr + 'numCookies', cookies.size.toString());
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const browser = yield puppeteer_1.default.launch({ headless: true });
            const page = yield browser.newPage();
            const urlAsString = 'https://bigbudpress.com/';
            yield page.goto(urlAsString, { waitUntil: 'networkidle2' }); // waits until page is fully loaded
            yield delay(1000, 2000); // emulates human behavior
            let url = new URL(urlAsString);
            const links = yield page.evaluate(() => {
                const anchors = document.getElementsByTagName('a');
                return Array.from(anchors).map(a => a.href);
            });
            // cookies
            const cookies = yield page.cookies();
            storeCookies(cookies, urlAsString);
            // certifications
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
    // connect to Redis server
    yield client.connect();
    // define seed URLs
    let seeds = [];
    yield main();
    // disconnect from Redis server
    yield client.disconnect();
});
/**
 * EXECUTION BEGINS HERE
 */
const client = (0, redis_1.createClient)({ url: "redis://127.0.0.1:6379" });
client.on('error', (err) => console.log('Redis Client Error', err));
run();
