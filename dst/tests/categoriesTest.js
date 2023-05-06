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
function delay(min, max) {
    return new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min) + min)));
}
function getCategories(document, url) {
    const categories = new Set;
    if (url == 'https://chnge.com') {
        // <div class='menu-grid'> list of <a>Category Name</a> elements </div>
        var divElement = document.getElementsByClassName('menu-grid')[0];
        console.log(divElement);
        Array.from(divElement.getElementsByTagName('a')).forEach((a) => {
            console.log(a.innerText);
            categories.add(a.innerText);
        });
    }
    return categories;
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
            var url = "https://chnge.com";
            yield page.goto(url, { waitUntil: 'networkidle2' }); // waits until page is fully loaded
            yield delay(1000, 2000); // emulates human behavior
            const res = yield page.evaluate(() => {
                // <div class='menu-grid'> list of <a>Category Name</a> elements </div>
                var collection = document.getElementsByClassName('menu-grid')[0].getElementsByTagName("a");
                return collection;
            });
            console.log(res);
            // Array.from(res.getElementsByTagName('a')).forEach( (a:HTMLAnchorElement) => {
            //     console.log(a.innerText);
            // });
            Array.from(res).forEach((a) => {
                console.log(a.innerText);
            });
            yield browser.close();
        }
        catch (e) {
            console.log(e);
        }
    });
}
main();
