"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keywordsRegExp = exports.certsRegExp = exports.sites = exports.abbreviations = void 0;
exports.abbreviations = new Map([
    ["https://www.forever21.com", "F21"],
    ["https://us.shein.com", "SH"],
    ["https://www.fashionnova.com", "FN"],
    ["https://www2.hm.com/en_us/index.html", "HM"],
    ["https://www.prettylittlething.us", "PLT"],
    ["https://bigbudpress.com", "BBP"],
    ["https://chnge.com", "CHNGE"],
    ["https://www.fashionbrandcompany.com", "FBC"],
    ["https://shoptunnelvision.com", "TV"],
    ["https://igirlworld.com", "IG"],
    ["https://grace-manning.com", "GM"],
    ["https://us.shein.com/SHEIN-BAE-Butterfly-Lace-Insert-Open-Back-Velvet-Bodycon-Dress-p-11983846-cat-1727.html?src_identifier=fc%3DWomen%60sc%3DDRESSES%60tc%3DSHOP%20BY%20LENGTH%60oc%3DShort%20Dresses%60ps%3Dtab01navbar06menu05dir01%60jc%3DitemPicking_00100608&src_module=topcat&src_tab_page_id=page_home1686887095623&mallCode=1", "TEST"]
]);
exports.sites = [
    'https://www.forever21.com',
    'https://us.shein.com',
    'https://www.fashionnova.com',
    'https://www2.hm.com/en_us/index.html',
    'https://www.prettylittlething.us',
    'https://bigbudpress.com',
    'https://chnge.com',
    'https://www.fashionbrandcompany.com',
    'https://shoptunnelvision.com',
    'https://igirlworld.com'
];
let certs = `(B Corp)|(B-Corp)
            |(OEKO-TEX)|(OEKO TEX)
            |(SEDEX)|(Supplier Ethical Data Exchange)
            |(SGS)|(Société Générale de Surveillance)
            |(Worldwide Responsible Accredited Production)
            |(NAFTA)|(North American Free Trade Agreement)
            |(GOTS)|(Global Organic Textile Standard)
            |(LEED)|(Leadership in Energy and Environmental Design)`;
exports.certsRegExp = new RegExp(certs, 'gi');
let keywords = `(sustainability)
               |(sustainable)
               |(recyclable)
               |(recycled)
               |(reusable)
               |(environment)
               |(environmentally friendly)
               |(social responsibility)
               |(ethical)
               |(fairtrade)`;
exports.keywordsRegExp = new RegExp(keywords, 'gi');
