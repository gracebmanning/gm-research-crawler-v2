import { HTTPResponse } from 'puppeteer';
import { delay, validLinks, exactSimilarity, isCollectionLink } from './helpers';

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
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1');
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

        // add URL to seen links
        seen.add(url);

        // get valid links, add to queue (and seen set) if not seen 
        let valid = validLinks(url, links);
        let categories:Set<string> = new Set();
        valid.forEach((l:string) => {
            var link = new URL(l);
            var path = link.pathname;
            if(url == "https://www.forever21.com"){
                if(path.includes("/us/shop/catalog/category/")){
                    path = path.replace("/us/shop/catalog/category/", "");
                    var sections = path.split("/");
                    categories.add(sections[1]);
                }
            }
            else if(url == "https://us.shein.com"){

            }
            else if(url == "https://www.fashionnova.com/collections"){
                if(path.includes("/collections/")){
                    categories.add(l);
                }
            }
            else if(url == "https://www2.hm.com/en_us/index.html"){
                path = path.replace("/en_us/", "");
                path = path.replace(".html", "");
                var sections = path.split("/");
                var menuCategories:Array<string> = ["women", "men", "divided", "baby", "kids", "home", "beauty", "sport", "sale", "sustainability-at-hm"];
                if(menuCategories.includes(sections[0])){
                    if(!path.includes("our-commitment") && !path.includes("our-work") && !path.includes("secondhand")){
                        categories.add(path);
                    }
                }
                console.log(path);
            }
            else if(url == "https://www.prettylittlething.us/site-map"){
                if(path.includes("/shop-by/")){
                    categories.add(l);
                }
            }
        });

        console.log(categories);
        console.log(categories.size);
        
        await browser.close();
    }
    catch (e) {
        console.log(e);
    }
}


let run = async()=>{
    let start = new Date().getTime(); // start timer
    
    let url = "https://www.prettylittlething.us/site-map";
    await main(url);

    console.log(((new Date().getTime() - start)/1000).toString() + ' seconds');
    
    let end = new Date().getTime(); // stop timer
    let totalSeconds = (end - start)/1000; // calculate time   
    console.log('TOTAL: ' + (totalSeconds).toString() + ' seconds');
}


/**
 * EXECUTION BEGINS HERE
 */

var seen:Set<string> = new Set(); // unique seen links

run();