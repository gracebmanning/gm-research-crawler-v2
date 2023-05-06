"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../helpers");
let urls = [
    'https://chnge.com/collections/kids-tees',
    'https://chnge.com/products/save-the-planet-baby-tee',
    'https://chnge.com/pages/info',
    'https://bigbudpress.com/collections/socks/products/thick-crew-sock?variant=41295637348545',
    'https://chnge.com/collections/mha21',
    'https://www.fashionnova.com/collections/going-out-1',
    'https://www.fashionbrandcompany.com/collections/bags-hats-sunglasses',
    'https://shoptunnelvision.com/collections/best-sellers-1',
    'https://shoptunnelvision.com/collections/best-sellers-1/products/compassion-woven-bead-choker',
    'https://igirlworld.com/collections/necklaces/products/suffering-nameplate?variant=44057148752091'
];
urls.forEach((elem) => {
    console.log(elem, (0, helpers_1.isCollectionLink)(elem));
});
