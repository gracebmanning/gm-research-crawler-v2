import { createClient } from 'redis';
import { delay, validLinks, exactSimilarity, storeData, searchContent, getCategories, storeNumPages } from './helpers';

/**
 * FUNCTION DEFINITIONS
 */

async function main(url:string) {
    try {
        const puppeteer = require('puppeteer-extra');
        const StealthPlugin = require('puppeteer-extra-plugin-stealth');
        puppeteer.use(StealthPlugin());

        const { executablePath } = require('puppeteer');
        const browser = await puppeteer.launch({ headless: true, executablePath: executablePath() });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/110.0.0.0 Mobile/15E148 Safari/604.1');

        await page.goto(url, { waitUntil: 'networkidle2' }); // waits until page is fully loaded
        await delay(1000, 2000); // emulates human behavior
        
        const divElement:HTMLDivElement = await page.evaluate((url:string) => {   
            var result:HTMLDivElement;
            // get categories
            if(url == 'https://chnge.com'){
                // <div class='menu-grid'> list of <a>Category Name</a> elements </div>
                result = <HTMLDivElement>document.getElementsByClassName('menu-grid')[0];
                console.log(result);
            }
            else{
                result = new HTMLDivElement();
            }
            return result;
        }, url);

        const categories = new Set<string>;
        var tempArray = Array.from(divElement.getElementsByTagName('a')).map( (a:HTMLAnchorElement) => { a.innerText });
        for(var e in tempArray){
            categories.add(e);
        }
        
        console.log(categories);
        storeData(client, url, 'categories', categories);
        
        await browser.close();
    }
    catch (e) {
        console.log(e);
    }
}

let run = async()=>{
    let start = new Date().getTime(); // start timer
    await client.connect(); // connect to Redis server

    for(const seedURL of seeds){
        queue.push(seedURL);
        while(queue.length != 0){
            let url = queue.pop(); // remove next url from queue
            if(url != undefined){
                await main(url);
            }
            console.log(seen);
            //console.log(categories);
            console.log(((new Date().getTime() - start)/1000).toString() + ' seconds');
        }
    }

    await client.disconnect(); // disconnect from Redis server
    let end = new Date().getTime(); // stop timer

    // calculate time  
    console.log('TOTAL: ' + ((end - start)/1000).toString() + ' seconds');
}


/**
 * EXECUTION BEGINS HERE
 */
const client = createClient({ url: "redis://127.0.0.1:6379" });
client.on('error', (err:Error) => console.log('Redis Client Error', err));

var seeds:Set<string> = new Set<string>;     // new Set(sites); use sites array from siteData.ts file              
seeds.add('https://chnge.com'); // just one seed URL right now

var queue:Array<string> = new Array(); // links to visit next
var seen:Set<string> = new Set(); // unique seen links

// data collection sets
//var categories = new Set<string>; // one set for an entire domain

run();