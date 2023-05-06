function delay(min: number, max: number){
    return new Promise(r => setTimeout(r, Math.floor(Math.random()*(max-min) + min)))
}

function getCategories(document:Document, url:string):Set<string>{
    const categories = new Set<string>;
    if(url == 'https://chnge.com'){
        // <div class='menu-grid'> list of <a>Category Name</a> elements </div>
        var divElement:HTMLDivElement = <HTMLDivElement>document.getElementsByClassName('menu-grid')[0];
        console.log(divElement);
        Array.from(divElement.getElementsByTagName('a')).forEach( (a:HTMLAnchorElement) => {
            console.log(a.innerText);
            categories.add(a.innerText);
        });
    }
    return categories;
}

async function main() {
    try{
        const puppeteer = require('puppeteer-extra');
        const StealthPlugin = require('puppeteer-extra-plugin-stealth');
        puppeteer.use(StealthPlugin());
        
        const { executablePath } = require('puppeteer');
        const browser = await puppeteer.launch({ headless: true, executablePath: executablePath() });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/110.0.0.0 Mobile/15E148 Safari/604.1');
        
        var url = "https://chnge.com";
        await page.goto(url, { waitUntil: 'networkidle2' }); // waits until page is fully loaded
        await delay(1000, 2000); // emulates human behavior
        
        const res:HTMLCollectionOf<HTMLAnchorElement> = await page.evaluate(() => {
            // <div class='menu-grid'> list of <a>Category Name</a> elements </div>
            var collection:HTMLCollectionOf<HTMLAnchorElement> = document.getElementsByClassName('menu-grid')[0].getElementsByTagName("a");
            return collection;
        });
        console.log(res);
        // Array.from(res.getElementsByTagName('a')).forEach( (a:HTMLAnchorElement) => {
        //     console.log(a.innerText);
        // });
        Array.from(res).forEach((a:HTMLAnchorElement) => {
            console.log(a.innerText);
        });

        await browser.close();
    }
    catch (e) {
        console.log(e);
    }
}

main();


