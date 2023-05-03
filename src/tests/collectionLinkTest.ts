import { isCollectionLink } from "../helpers";

let urls = [
    'https://chnge.com/collections/kids-tees', 
    'https://chnge.com/products/save-the-planet-baby-tee',
    'https://chnge.com/pages/info'];

urls.forEach((elem:string) => {
    console.log(isCollectionLink(elem));
});