import { HTTPResponse } from 'puppeteer';
import { delay } from '../helpers';

/**
 * FUNCTION DEFINITIONS
 */

async function main(url:string) {
    try {
        console.log('crawling:', url);
        const puppeteer = require('puppeteer-extra');
        const StealthPlugin = require('puppeteer-extra-plugin-stealth');
        puppeteer.use(StealthPlugin());

        const { executablePath } = require('puppeteer');
        const browser = await puppeteer.launch({ headless: true, executablePath: executablePath() });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/110.0.0.0 Mobile/15E148 Safari/604.1');
        await page.setDefaultNavigationTimeout(0);
        await page.goto(url, { waitUntil: 'networkidle2' }); // waits until page is fully loaded
        await delay(1000, 2000); // emulates human behavior

        const statusCode = await page.waitForResponse((response:HTTPResponse) => {
            return response.status();
        });
        if(statusCode == 404){
            throw new Error('404 error');
        }
        
        const price = await page.evaluate(() => {   
            // get price
            //const originalPrice = document.getElementsByClassName("price__original")[0];
            //const salePrice = document.getElementsByClassName("price__")

            var priceElem;
            const spanElements = Array.from(document.getElementsByTagName('span'));
            for(var elem of spanElements){
                if(elem.getAttribute('itemprop') == 'price'){
                    priceElem = elem;
                }
            }
            return priceElem?.innerText;
        });
        console.log(price);

        // add URL to seen links
        seen.add(url);

        const content = await page.content();

        await browser.close();
    }
    catch (e) {
        console.log(e);
    }
}

let run = async()=>{
    let start = new Date().getTime(); // start timer
    
    for(const seedURL of seeds){
        queue.push(seedURL);
        while(queue.length != 0){
            let url = queue.pop(); // remove next url from queue
            if(url != undefined){
                await main(url);
            }
            console.log(((new Date().getTime() - start)/1000).toString() + ' seconds');
        }
        seen.clear(); // seen is empty for next seedURL
    }
    let end = new Date().getTime(); // stop timer
    let totalSeconds = (end - start)/1000; // calculate time   
    console.log('TOTAL: ' + (totalSeconds).toString() + ' seconds');
}


/**
 * EXECUTION BEGINS HERE
 */
var seeds:Set<string> = new Set<string>;     // new Set(sites); use sites array from siteData.ts file
var seed = 'https://www.forever21.com/us/2000482317.html?dwvar_2000482317_color=03';    
seeds.add(seed); // just one seed URL right now

var queue:Array<string> = new Array(); // links to visit next
var seen:Set<string> = new Set(); // unique seen links
var shaKeys:Set<string> = new Set(); // SHA keys for exact similarity detection

// data collection sets
var categories = new Set<string>; // one set for an entire domain

run();