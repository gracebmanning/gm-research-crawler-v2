import { abbreviations } from './siteData';

export function getAbbr(url:string):string{
    let result = abbreviations.get(url);
    if(typeof(result) == "string"){
        return result;
    }
    else{
        return "";
    }
}
export function getCategories(url:URL){
    return url;
}

