// import * as fs from 'fs';
import { createHash } from 'node:crypto';
var JSSoup = require('jssoup').default;

function delay(min: number, max: number){
    return new Promise(r => setTimeout(r, Math.floor(Math.random()*(max-min) + min)))
}

async function main() {
    try{
        const puppeteer = require('puppeteer-extra');
        const StealthPlugin = require('puppeteer-extra-plugin-stealth');
        puppeteer.use(StealthPlugin());
        
        const { executablePath } = require('puppeteer');
        const browser = await puppeteer.launch({ headless: true, executablePath: executablePath() });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/110.0.0.0 Mobile/15E148 Safari/604.1');
        
        var url = "https://chnge.com/collections_library11-17-detail";
        await page.goto(url, { waitUntil: 'networkidle2' }); // waits until page is fully loaded
        await delay(1000, 2000); // emulates human behavior
        const contentOne = await page.content();

        var url = "https://chnge.com/collections_library11-16-detail#!";
        await page.goto(url, { waitUntil: 'networkidle2' }); // waits until page is fully loaded
        await delay(1000, 2000); // emulates human behavior
        const contentTwo = await page.content();

        var bodyOne = new JSSoup(contentOne).find('body').text;
        var bodyTwo = new JSSoup(contentTwo).find('body').text;

        const hashOne = createHash('sha1');
        hashOne.update(bodyOne);
        const keyOne = hashOne.digest('hex');
        
        const hashTwo = createHash('sha1');
        hashTwo.update(bodyTwo);
        const keyTwo = hashTwo.digest('hex');

        // fs.writeFileSync('one.txt', bodyOne);
        // fs.writeFileSync('two.txt', bodyTwo);

        console.log(keyOne);
        console.log(keyTwo);
        console.log(keyOne == keyTwo);

        await browser.close();
    }
    catch (e) {
        console.log(e);
    }
}

main();