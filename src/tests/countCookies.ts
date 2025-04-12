import { HTTPResponse } from 'puppeteer';
import { delay, validLinks, exactSimilarity } from '../helpers';

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
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2 like Mac OS X) AppleWebKit/605.1.15 CriOS/110.0.0.0 Mobile/15E148 Safari/604.1');
        await page.setDefaultNavigationTimeout(0);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 }); // waits until page is fully loaded
        await delay(1000, 2000); // emulates human behavior

        const statusCode = await page.waitForResponse((response:HTTPResponse) => {
            return response.status();
        });
        console.log(statusCode);
        if(statusCode == 404){
            throw new Error('404 error');
        }
        
        const links:Array<string> = await page.evaluate(() => {   
            // get links
            const anchors = document.getElementsByTagName('a');
            return Array.from(anchors).map(a => a.href);
        });
        console.log("links: ", links);

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
    
            const cookies = await page.cookies();
            const numCookies = new Set(Array.from(cookies).map(c => JSON.stringify(c))).size;
            console.log("cookies:", numCookies);
        }
        await browser.close();
    }
    catch (e) {
        console.log(e);
    }
}


let run = async()=>{
    let start = new Date().getTime(); // start timer
    
    let url = seed;
    if(url != undefined){
        await main(url);
    }
    //console.log(categories);
    console.log(((new Date().getTime() - start)/1000).toString() + ' seconds');
    
    seen.clear(); // seen is empty for next seedURL
    
    let end = new Date().getTime(); // stop timer
    let totalSeconds = (end - start)/1000; // calculate time   
    console.log('TOTAL: ' + (totalSeconds).toString() + ' seconds');
}


/**
 * EXECUTION BEGINS HERE
 */
var seeds:Set<string> = new Set<string>;    // new Set(sites); use sites array from siteData.ts fill
var seed = "https://shoptunnelvision.com";
seeds.add(seed); // just one seed URL right now

var queue:Array<string> = new Array(); // links to visit next
var seen:Set<string> = new Set(); // unique seen links
var shaKeys:Set<string> = new Set(); // SHA keys for exact similarity detection

// data collection sets
var categories = new Set<string>; // one set for an entire domain

run();