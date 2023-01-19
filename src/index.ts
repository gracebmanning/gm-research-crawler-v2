import puppeteer from 'puppeteer';

function delay(min: number, max: number){
    return new Promise(r => setTimeout(r, Math.floor(Math.random()*(max-min) + min)))
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

        const cookies = await page.cookies();
        console.log(JSON.stringify(cookies));

        await browser.close();
    }
    catch(e){
        console.log(e)
    }
}

let run = async()=>{
    await main();
}

run();