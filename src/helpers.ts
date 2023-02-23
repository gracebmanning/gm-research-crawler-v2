import { abbreviations, certsRegExp } from './siteData';

export function getAbbr(url:string):string{
    let result = abbreviations.get(url);
    if(typeof(result) == "string"){
        return result;
    }
    else{
        return "";
    }
}

// returns array of links with same domain name as url
export function validLinks(url:string, links:string[]):string[]{
    var valid:string[] = [];
    let domain = new URL(url).hostname;
    
    links.forEach( (l) => {
        if(l != '' && new URL(l).hostname == domain){
            valid.push(l);
        }
    });

    return valid;
}

export function countCertifications(content:string):number{
    var count = (content.match(certsRegExp) || []).length;
    return count;


}