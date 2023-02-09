import puppeteer from 'puppeteer';
import { Protocol } from 'puppeteer';
import { createClient } from 'redis';
import { getAbbr } from './helpers';

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
    const cookies:string[] = Array.from(cookiesList).map(c => JSON.stringify(c));
    
    let abbr:string = getAbbr(urlAsString);
    setData(urlAsString, 'cookies', abbr+'cookies'); // store set of cookies
    setData(urlAsString, 'numCookies', abbr+'numCookies'); // store numCookies
    for(let i=0; i < cookies.length; i++){
        await client.LPUSH(abbr+'cookies', cookies[i]);
    }
    await client.SET(abbr+'numCookies', cookies.length.toString());
}

async function main() {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        const urlAsString = 'https://bigbudpress.com/';

        await page.goto(urlAsString, { waitUntil: 'networkidle2' }); // waits until page is fully loaded
        await delay(1000, 2000); // emulates human behavior

        let url = new URL(urlAsString);

        const links = await page.evaluate(() => {
            const anchors = document.getElementsByTagName('a');
            return Array.from(anchors).map(a => a.href);
        });

        // cookies
        const cookies = await page.cookies();
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
        await browser.close();
    }
    catch (e) {
        console.log(e);
    }
}

let run = async()=>{
    // connect to Redis server
    await client.connect();

    // define seed URLs
    let seeds = [];

    await main();

    // disconnect from Redis server
    await client.disconnect();
}


/**
 * EXECUTION BEGINS HERE
 */
const client = createClient({ url: "redis://127.0.0.1:6379" });
client.on('error', (err:Error) => console.log('Redis Client Error', err));
run();