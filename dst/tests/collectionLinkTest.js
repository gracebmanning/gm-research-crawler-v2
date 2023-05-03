"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../helpers");
let urls = [
    'https://chnge.com/collections/kids-tees',
    'https://chnge.com/products/save-the-planet-baby-tee',
    'https://chnge.com/pages/info'
];
urls.forEach((elem) => {
    console.log((0, helpers_1.isCollectionLink)(elem));
});
