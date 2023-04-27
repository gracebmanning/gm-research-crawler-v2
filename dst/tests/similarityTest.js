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
// import * as fs from 'fs';
const node_crypto_1 = require("node:crypto");
var JSSoup = require('jssoup').default;
function delay(min, max) {
    return new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min) + min)));
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const puppeteer = require('puppeteer-extra');
            const StealthPlugin = require('puppeteer-extra-plugin-stealth');
            puppeteer.use(StealthPlugin());
            const { executablePath } = require('puppeteer');
            const browser = yield puppeteer.launch({ headless: true, executablePath: executablePath() });
            const page = yield browser.newPage();
            yield page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/110.0.0.0 Mobile/15E148 Safari/604.1');
            var url = "https://chnge.com/collections_library11-17-detail";
            yield page.goto(url, { waitUntil: 'networkidle2' }); // waits until page is fully loaded
            yield delay(1000, 2000); // emulates human behavior
            const contentOne = yield page.content();
            var url = "https://chnge.com/collections_library11-16-detail#!";
            yield page.goto(url, { waitUntil: 'networkidle2' }); // waits until page is fully loaded
            yield delay(1000, 2000); // emulates human behavior
            const contentTwo = yield page.content();
            var bodyOne = new JSSoup(contentOne).find('body').text;
            var bodyTwo = new JSSoup(contentTwo).find('body').text;
            const hashOne = (0, node_crypto_1.createHash)('sha1');
            hashOne.update(bodyOne);
            const keyOne = hashOne.digest('hex');
            const hashTwo = (0, node_crypto_1.createHash)('sha1');
            hashTwo.update(bodyTwo);
            const keyTwo = hashTwo.digest('hex');
            // fs.writeFileSync('one.txt', bodyOne);
            // fs.writeFileSync('two.txt', bodyTwo);
            console.log(keyOne);
            console.log(keyTwo);
            console.log(keyOne == keyTwo);
            yield browser.close();
        }
        catch (e) {
            console.log(e);
        }
    });
}
main();
