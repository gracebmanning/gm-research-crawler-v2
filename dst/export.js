"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const readline = __importStar(require("readline"));
let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function loadData(key) {
    return __awaiter(this, void 0, void 0, function* () {
        const value = yield client.get(key);
        console.log(value);
    });
}
let exportAllData = () => __awaiter(void 0, void 0, void 0, function* () {
});
// export data for one URL
let exportURLData = (url) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(url);
    return url;
});
const client = (0, redis_1.createClient)({ url: "redis://127.0.0.1:6379" });
client.on('error', (err) => console.log('Redis Client Error', err));
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
10: https://igirlworld.com/\n`;
rl.question(question, (answer) => {
    switch (answer.toLowerCase()) {
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
