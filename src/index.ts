import puppeteer from 'puppeteer';
import { Protocol } from 'puppeteer';
import { createClient } from 'redis';
import { getAbbr, validLinks } from './helpers';

/**
 * FUNCTION DEFINITIONS
 */

function delay(min: number, max: number){
    return new Promise(r => setTimeout(r, Math.floor(Math.random()*(max-min) + min)))
}

async function setData(url:string, key:string, value:any){    
    await client.HSET(url, key, value);
}

async function storeCookies(cookiesList:Protocol.Network.Cookie[], urlAsString:string){
    const cookies:Set<string> = new Set(Array.from(cookiesList).map(c => JSON.stringify(c)));
    
    let abbr:string = getAbbr(urlAsString);
    setData(urlAsString, 'cookies', abbr+'cookies'); // store set of cookies
    setData(urlAsString, 'numCookies', abbr+'numCookies'); // store numCookies
    for(let c of cookies){
        var result:number = await client.SADD(abbr+'cookies', c);
        console.log(result);
    }
    await client.SET(abbr+'numCookies', cookies.size.toString());
}

async function main() {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        const url = 'https://bigbudpress.com/';

        await page.goto(url, { waitUntil: 'networkidle2' }); // waits until page is fully loaded
        await delay(1000, 2000); // emulates human behavior

        const links = await page.evaluate(() => {
            const anchors = document.getElementsByTagName('a');
            return Array.from(anchors).map(a => a.href);
        });

        // add URL to visited
        visited.add(url);

        // add valid links to queue
        queue.concat(validLinks(url, links));

        // cookies
        const cookies = await page.cookies();
        storeCookies(cookies, url);

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
        await browser.close();
    }
    catch (e) {
        console.log(e);
    }
}

let run = async()=>{
    await client.connect(); // connect to Redis server
    await main();
    await client.disconnect(); // disconnect from Redis server
}


/**
 * EXECUTION BEGINS HERE
 */
const client = createClient({ url: "redis://127.0.0.1:6379" });
client.on('error', (err:Error) => console.log('Redis Client Error', err));

var seeds:Set<string> = new Set();     // var seeds = new Set(sites); ...use sites array from siteData.ts file              
seeds.add('https://bigbudpress.com/'); // just one seed URL right now

var queue:Array<string> = new Array(); // links to visit next
var visited:Set<string> = new Set(); // unique visited links

run();