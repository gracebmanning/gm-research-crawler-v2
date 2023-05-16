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
  const filename = './data/' + abbr + 'log.json';
  const cookiesFilename = './data/' + abbr + 'cookies.json';

  var dict:{[key:string]:any} = {};
  var cookiesDict:{[key:string]:any} = {};

  // cookies
  const cookiesSet = await client.SMEMBERS(abbr+'cookies');
  const cookies = Array.from(cookiesSet);
  cookiesDict['cookies'] = cookies;
  
  let numCookies = await client.GET(abbr+'numcookies');
  if(numCookies == null){numCookies = " "};
  dict['numcookies'] = numCookies;

  // keywords
  const keywordsSet = await client.SMEMBERS(abbr+'keywords');
  const keywords = Array.from(keywordsSet);
  dict['keywords'] = keywords;
  
  let numkeywords = await client.GET(abbr+'numkeywords');
  if(numkeywords == null){numkeywords = " "};
  dict['numkeywords'] = numkeywords;

  // certs
  const certsSet = await client.SMEMBERS(abbr+'certs');
  const certs = Array.from(certsSet);
  dict['certs'] = certs;

  let numcerts = await client.GET(abbr+'numcerts');
  if(numcerts == null){numcerts = " "};
  dict['numcerts'] = numcerts;

  // categories
  const categoriesSet = await client.SMEMBERS(abbr+'categories');
  const categories = Array.from(categoriesSet);
  dict['categories'] = categories;

  let numcategories = await client.GET(abbr+'numcategories');
  if(numcategories == null){numcategories = " " };
  dict['numcategories'] = numcategories;

  // numpages
  let numpages = await client.GET(abbr+'numpages');
  if(numpages == null){numpages = " "};
  dict['numpages'] = numpages;

  // time
  let time = await client.GET(abbr+'time');
  if(time == null){time = " "};
  dict['time'] = time;

  var dictstring = JSON.stringify(dict);
  fs.writeFileSync(filename, dictstring);
  
  var cookiesDictstring = JSON.stringify(cookiesDict);
  fs.writeFileSync(cookiesFilename, cookiesDictstring);

  await client.disconnect();
}

const client = createClient({ url: "redis://127.0.0.1:6379" });
client.on('error', (err:Error) => console.log('Redis Client Error', err));

let question = `Which URL data would you like to export?\n
0: empty\n
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
        exportURLData('');
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
