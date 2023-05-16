import { createClient } from 'redis';
import { delay, validLinks, exactSimilarity, storeData, searchContent, getCategories, storeNumPages, isCollectionLink, storeTime } from './helpers';

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
        
        const links = await page.evaluate(() => {   
            // get links
            const anchors = document.getElementsByTagName('a');
            return Array.from(anchors).map(a => a.href);
        });

        // add URL to seen links
        seen.add(url);

        const content = await page.content();

        // exact similarity detection
        const exact = exactSimilarity(shaKeys, content);
        if(!exact){

            // get valid links, add to queue (and seen set) if not seen 
            let valid = validLinks(url, links);
            valid.forEach((l) => {
                if(!seen.has(l)){
                    queue.push(l);
                    seen.add(l);
                }
            });
    
            // cookies
            const cookies = await page.cookies();
            storeData(client, url, 'cookies', new Set(Array.from(cookies).map(c => JSON.stringify(c))));

            // certifications
            storeData(client, url, 'certs', searchContent('certs', content));
            
            // sustainability count (count num keywords / buzzwords)
            storeData(client, url, 'keywords', searchContent('keywords', content));

            // categories
            if(isCollectionLink(url)){
                categories.add(url);
            }
            storeData(client, url, 'categories', categories); 

            // sizes
            // store set of sizes seen on site (unique)

            // prices
            // can calculate average price
        }
        await browser.close();
    }
    catch (e) {
        console.log(e);
    }
}

let run = async()=>{
    await client.connect(); // connect to Redis server
    let start = new Date().getTime(); // start timer
    
    for(const seedURL of seeds){
        queue.push(seedURL);
        while(queue.length != 0){
            let url = queue.pop(); // remove next url from queue
            if(url != undefined){
                await main(url);
            }
            //console.log(seen);
            console.log(seen.size);
            //console.log(categories);
            console.log(((new Date().getTime() - start)/1000).toString() + ' seconds');
        }
        await storeNumPages(client, seedURL, seen); // stores number of pages for url
        seen.clear(); // seen is empty for next seedURL
    }
    let end = new Date().getTime(); // stop timer
    let totalSeconds = (end - start)/1000; // calculate time   
    await storeTime(client, seed, totalSeconds); // store time in Redis
    console.log('TOTAL: ' + (totalSeconds).toString() + ' seconds');
    
    await client.disconnect(); // disconnect from Redis server
}


/**
 * EXECUTION BEGINS HERE
 */
const client = createClient({ url: "redis://127.0.0.1:6379" });
client.on('error', (err:Error) => console.log('Redis Client Error', err));

var seeds:Set<string> = new Set<string>;     // new Set(sites); use sites array from siteData.ts file
var seed = 'https://www2.hm.com/en_us/index.html';    
seeds.add(seed); // just one seed URL right now

var queue:Array<string> = new Array(); // links to visit next
var seen:Set<string> = new Set(); // unique seen links
var shaKeys:Set<string> = new Set(); // SHA keys for exact similarity detection

// data collection sets
var categories = new Set<string>; // one set for an entire domain

run();