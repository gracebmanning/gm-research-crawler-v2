import puppeteer from 'puppeteer';
import { createClient } from 'redis';

/**
 * FUNCTION DEFINITIONS
 */

function delay(min: number, max: number){
    return new Promise(r => setTimeout(r, Math.floor(Math.random()*(max-min) + min)))
}

async function setData(key:string, value:any){    
    await client.set(key, value);
}

async function loadData(key:string){
    const value = await client.get(key);
    console.log(value);
}

let main = async()=>{
    try{
        const browser = await puppeteer.launch({ headless:true });
        const page = await browser.newPage();
        const URL = 'https://grace-manning.com';
        
        await page.goto(URL, {waitUntil: 'networkidle2'}); // waits until page is fully loaded
        await delay(1000, 2000); // emulates human behavior
        
        const links = await page.evaluate(() => {
            const anchors = document.getElementsByTagName('a');
            return Array.from(anchors).map(a => a.href);
        })
        console.log(links);

        //setData("numLinks", links.length);
        //loadData("numLinks");

        const cookies = await page.cookies();
        console.log(JSON.stringify(cookies));

        await browser.close();
    }
    catch(e){
        console.log(e)
    }
}

let run = async()=>{
    await client.connect();
    await main();
    await client.disconnect();
}


/**
 * EXECUTION BEGINS HERE
 */
const client = createClient({ url: "redis://127.0.0.1:6379" });
client.on('error', (err:Error) => console.log('Redis Client Error', err));
run();