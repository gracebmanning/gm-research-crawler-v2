import { createClient } from 'redis';
import * as readline from 'readline';
import * as fs from 'fs';
import { getAbbr } from './helpers';

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function loadData(url:string, field:string){
    const value = await client.HGET(url, field);
    console.log(value);
}

let exportAllData = async()=>{


}

// export data for one URL
let exportURLData = async(url:string)=>{
  await client.connect();
  const abbr = getAbbr(url);
  console.log(abbr, url);
  const filename = './output/' + abbr + 'log.txt';

  // cookies
  const cookiesSet = await client.SMEMBERS(abbr+'cookies');
  const cookies = Array.from(cookiesSet).join(',');
  let numCookies = await client.GET(abbr+'numcookies');
  if(numCookies == null){ numCookies = " "};
  fs.writeFileSync(filename, 'cookies: ' + cookies + '\n', {flag:'a'});
  fs.writeFileSync(filename, 'numCookies: ' + numCookies + '\n', {flag:'a'});

  // keywords
  const keywordsSet = await client.SMEMBERS(abbr+'keywords');
  const keywords = Array.from(keywordsSet).join(',');
  let numkeywords = await client.GET(abbr+'numkeywords');
  if(numkeywords == null){ numkeywords = " "};
  fs.writeFileSync(filename, 'keywords: ' + keywords + '\n', {flag:'a'});
  fs.writeFileSync(filename, 'numkeywords: ' + numkeywords + '\n', {flag:'a'});

  // certs
  const certsSet = await client.SMEMBERS(abbr+'certs');
  const certs = Array.from(certsSet).join(',');
  let numcerts = await client.GET(abbr+'numcerts');
  if(numcerts == null){ numcerts = " "};
  fs.writeFileSync(filename, 'certs: ' + certs + '\n', {flag:'a'});
  fs.writeFileSync(filename, 'numcerts: ' + numcerts + '\n', {flag:'a'});

  // categories
  const categoriesSet = await client.SMEMBERS(abbr+'categories');
  const categories = Array.from(categoriesSet).join(',');
  let numcategories = await client.GET(abbr+'numcategories');
  if(numcategories == null){ numcategories = " "};
  fs.writeFileSync(filename, 'categories: ' + categories + '\n', {flag:'a'});
  fs.writeFileSync(filename, 'numcategories: ' + numcategories + '\n', {flag:'a'});

  // numpages
  let numpages = await client.GET(abbr+'numpages');
  if(numpages == null){ numpages = " "};
  fs.writeFileSync(filename, 'numpages: ' + numpages + '\n', {flag:'a'});

  // time
  let time = await client.GET(abbr+'time');
  if(time == null){ time = " "};
  fs.writeFileSync(filename, 'time: ' + time + '\n', {flag:'a'});

  await client.disconnect();
}

const client = createClient({ url: "redis://127.0.0.1:6379" });
client.on('error', (err:Error) => console.log('Redis Client Error', err));

let question = `Which URL data would you like to export?\n
0: all URL data\n
1: https://www.forever21.com/\n
2: https://us.shein.com/\n
3: https://www.fashionnova.com/\n
4: https://www2.hm.com/en_us/index.html\n
5: https://www.prettylittlething.us/\n
6: https://bigbudpress.com/\n
7: https://chnge.com\n
8: https://www.fashionbrandcompany.com/\n
9: https://shoptunnelvision.com/\n
10: https://igirlworld.com/\n\n`;

rl.question(question, (answer) => {
    switch(answer.toLowerCase()) {
      case '0':
        exportAllData();
        break;
      case '1':
        exportURLData('https://www.forever21.com');
        break;
      case '2':
        exportURLData('https://us.shein.com');
        break;
      case '3':
        exportURLData('https://www.fashionnova.com');
        break;
      case '4':
        exportURLData('https://www2.hm.com/en_us/index.html');
        break;
      case '5':
        exportURLData('https://www.prettylittlething.us');
        break;
      case '6':
        exportURLData('https://bigbudpress.com');
        break;
      case '7':
        exportURLData('https://chnge.com');
        break;
      case '8':
        exportURLData('https://www.fashionbrandcompany.com');
        break;
      case '9':
        exportURLData('https://shoptunnelvision.com');
        break;
      case '10':
      exportURLData('https://igirlworld.com');
      break;
      default:
        console.log('Invalid answer!');
    }
    rl.close();
  });
