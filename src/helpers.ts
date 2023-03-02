import { abbreviations, certsRegExp } from './siteData';
import { Protocol } from 'puppeteer';
import { RedisClientType } from '@redis/client';

export function getAbbr(url:string):string{
    let result = abbreviations.get(url);
    if(typeof(result) == "string"){
        return result;
    }
    else{
        return "";
    }
}

export function getUrlBase(url:string):string{
    let urlObj = new URL(url);
    return urlObj.protocol + "//" + urlObj.hostname;
}

// returns array of links with same domain name as url
export function validLinks(url:string, links:string[]):string[]{
    var valid:string[] = [];
    let domain = new URL(url).hostname;
    
    links.forEach( (l) => {
        if(l != '' && new URL(l).hostname == domain){
            let result = l.replace(/#[a-zA-Z]*/gm, "");
            if(result.slice(-1) == "/"){
                result = result.substring(0, result.length-1);
            }
            valid.push(result);
        }
    });
    return valid;
}

export function countCertifications(content:string):number{
    var count = (content.match(certsRegExp) || []).length;
    return count;
}

export async function storeCookies(untypedClient:any, cookiesList:Protocol.Network.Cookie[], urlAsString:string){
    let client = <RedisClientType>untypedClient;
    const cookies:Set<string> = new Set(Array.from(cookiesList).map(c => JSON.stringify(c)));
    let urlBase:string = getUrlBase(urlAsString);
    let abbr:string = getAbbr(urlBase);

    // check if cookies key is already defined
    let key1 = await client.EXISTS(abbr+'cookies');
    if(key1 == 0){
        await client.HSET(urlAsString, 'cookies', abbr+'cookies'); // store reference to set of cookies
    }
    // check if numCookies key is already defined
    let key2 = await client.EXISTS(abbr+'numCookies')
    if(key2 == 0){
        await client.HSET(urlAsString, 'numCookies', abbr+'numCookies'); // store reference to numCookies
    }
    
    // create set of cookies
    for(let c of cookies){
        await client.SADD(abbr+'cookies', c);
    }

    // store numCookies
    await client.SET(abbr+'numCookies', cookies.size.toString());
}


export async function storeCertifications(untypedClient:any, content:string){
    var count = countCertifications(content);
    let client = <RedisClientType>untypedClient;
    // store in Redis
}
