import puppeteer from 'puppeteer';
import { Protocol } from 'puppeteer';
import { createClient } from 'redis';
import { countCertifications, getAbbr, validLinks } from './helpers';

/**
 * FUNCTION DEFINITIONS
 */

function delay(min: number, max: number){
    return new Promise(r => setTimeout(r, Math.floor(Math.random()*(max-min) + min)))
}

async function storeCookies(cookiesList:Protocol.Network.Cookie[], urlAsString:string){
    const cookies:Set<string> = new Set(Array.from(cookiesList).map(c => JSON.stringify(c)));
    let abbr:string = getAbbr(urlAsString);

    await client.HSET(urlAsString, 'cookies', abbr+'cookies'); // store reference to set of cookies
    await client.HSET(urlAsString, 'numCookies', abbr+'numCookies'); // store reference to numCookies
    
    // create set of cookies
    for(let c of cookies){
        await client.SADD(abbr+'cookies', c);
    }

    // store numCookies
    await client.SET(abbr+'numCookies', cookies.size.toString());
}

async function storeCertifications(content:string){
    var count = countCertifications(content);
    // store in Redis
}

async function main(url:string) {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/110.0.0.0 Mobile/15E148 Safari/604.1');

        await page.goto(url, { waitUntil: 'networkidle2' }); // waits until page is fully loaded
        await delay(1000, 2000); // emulates human behavior

        const links = await page.evaluate(() => {
            const anchors = document.getElementsByTagName('a');
            return Array.from(anchors).map(a => a.href);
        });

        // add URL to visited
        seen.add(url);

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
        storeCookies(cookies, url);

        // certifications
        const content = await page.content();
        storeCertifications(content);
        
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

    for(const seedURL of seeds){
        queue.push(seedURL);
        while(queue.length != 0){
            let url = queue.pop(); // remove next url from queue
            if(url != undefined){
                await main(url);
            }
            console.log(queue);
        }
    }

    await client.disconnect(); // disconnect from Redis server
}


/**
 * EXECUTION BEGINS HERE
 */
const client = createClient({ url: "redis://127.0.0.1:6379" });
client.on('error', (err:Error) => console.log('Redis Client Error', err));

var seeds:Set<string> = new Set();     // var seeds = new Set(sites); ...use sites array from siteData.ts file              
seeds.add('https://www.sezane.com/us'); // just one seed URL right now

var queue:Array<string> = new Array(); // links to visit next
var seen:Set<string> = new Set(); // unique seen links

run();