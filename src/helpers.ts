import { abbreviations, certsRegExp, keywordsRegExp } from './siteData';
import { Protocol } from 'puppeteer';
import { createHash } from 'node:crypto';
import { RedisClientType } from '@redis/client';
var JSSoup = require('jssoup').default;

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
            // remove slash at end of URL
            if(result.slice(-1) == "/"){
                result = result.substring(0, result.length-1);
            }
            // remove exclamation points at end of URL
            while(result.slice(-1) == "!"){
                result = result.substring(0, result.length-1);
            }
            valid.push(result);
        }
    });
    return valid;
}

export function exactSimilarity(keys:Set<string>, content:string):boolean{
    var body = new JSSoup(content).find('body').text; // get body content as string

    const hash = createHash('sha1');
    hash.update(body);
    const key = hash.digest('hex');

    if(keys.has(key)){
        return true;
    }
    else{
        keys.add(key);
        return false;
    }
}

// used for collecting certifications and keywords
export function searchContent(type:string, content:string):Set<string>{
    let regex = (type == "certs") ? certsRegExp : keywordsRegExp;
    let matches = content.match(regex)?.map(c => c.toLowerCase());
    return new Set(matches);
}

// used to set hash references for a url
async function setReferences(type:string, untypedClient:any, abbr:string, urlAsString:string){
    let client = <RedisClientType>untypedClient;
    // check if [type] key is already defined
    let key1 = await client.EXISTS(abbr+type);
    if(key1 == 0){
        await client.HSET(urlAsString, type, abbr+type); // store reference to set of cookies
    }
    // check if num[type] key is already defined
    let key2 = await client.EXISTS(abbr+'num'+type)
    if(key2 == 0){
        await client.HSET(urlAsString, 'num'+type, abbr+'num'+type); // store reference to numCookies
    }
}

export async function storeCookies(untypedClient:any, cookiesList:Protocol.Network.Cookie[], urlAsString:string){
    let client = <RedisClientType>untypedClient;
    let urlBase:string = getUrlBase(urlAsString);
    let abbr:string = getAbbr(urlBase);
    const cookies:Set<string> = new Set(Array.from(cookiesList).map(c => JSON.stringify(c)));

    setReferences('cookies', client, abbr, urlAsString);
    
    // store set of cookies
    for(let c of cookies){
        await client.SADD(abbr+'cookies', c);
    }

    // store numCookies
    await client.SET(abbr+'numcookies', cookies.size.toString());
}


export async function storeCertifications(untypedClient:any, content:string, urlAsString:string){
    let client = <RedisClientType>untypedClient;
    let urlBase:string = getUrlBase(urlAsString);
    let abbr:string = getAbbr(urlBase);
    var certs:Set<string> = searchContent('certs', content);

    setReferences('certs', client, abbr, urlAsString);

    // store in Redis
    // create set of certs
    for(let c of certs){
        await client.SADD(abbr+'certs', c);
    }

    // store numCerts
    await client.SET(abbr+'numcerts', certs.size.toString());
}

export async function storeKeywords(untypedClient:any, content:string, urlAsString:string){
    let client = <RedisClientType>untypedClient;
    let urlBase:string = getUrlBase(urlAsString);
    let abbr:string = getAbbr(urlBase);
    var keywords:Set<string> = searchContent('keywords', content);

    setReferences('keywords', client, abbr, urlAsString);

    // store in Redis
    // create set of keywords
    for(let k of keywords){
        await client.SADD(abbr+'keywords', k);
    }

    // store numKeywords
    await client.SET(abbr+'numkeywords', keywords.size.toString());
}

// type = cookies, certs, keywords
export async function storeData(untypedClient: any, urlAsString:string, type:string, dataset:Set<string>){
    let client = <RedisClientType>untypedClient;
    let urlBase:string = getUrlBase(urlAsString);
    let abbr:string = getAbbr(urlBase);
    var data:Set<string> = dataset;

    setReferences(type, client, abbr, urlAsString);

    // store in Redis
    // create set of data
    for(let d of data){
        await client.SADD(abbr+type, d);
    }

    // store numData
    await client.SET(abbr+'num'+type, data.size.toString());
    

}