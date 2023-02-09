import { createClient } from 'redis';
import * as readline from 'readline';

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function loadData(key:string){
    const value = await client.get(key);
    console.log(value);
}

let exportAllData = async()=>{

}

// export data for one URL
let exportURLData = async(url:string)=>{
  console.log(url);
  return url;
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
7: https://www.sezane.com/us\n
8: https://www.fashionbrandcompany.com/\n
9: https://shoptunnelvision.com/\n
10: https://igirlworld.com/\n\n`;

rl.question(question, (answer) => {
    switch(answer.toLowerCase()) {
      case '0':
        exportAllData();
        break;
      case '1':
        exportURLData('https://www.forever21.com/');
        break;
      case '2':
        exportURLData('https://us.shein.com/');
        break;
      case '3':
        exportURLData('https://www.fashionnova.com/');
        break;
      case '4':
        exportURLData('https://www2.hm.com/en_us/index.html');
        break;
      case '5':
        exportURLData('https://www.prettylittlething.us/');
        break;
      case '6':
        exportURLData('https://bigbudpress.com/');
        break;
      case '7':
        exportURLData('https://www.sezane.com/us');
        break;
      case '8':
        exportURLData('https://www.fashionbrandcompany.com/');
        break;
      case '9':
        exportURLData('https://shoptunnelvision.com/');
        break;
      case '10':
      exportURLData('https://igirlworld.com/');
      break;
      default:
        console.log('Invalid answer!');
    }
    rl.close();
  });
