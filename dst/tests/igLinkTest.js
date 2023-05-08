"use strict";
let l = 'https://igirlworld.com/es/collections/all';
let url = 'https://igirlworld.com';
// if(new URL(l).hostname == 'igirlworld.com'){
//     if(l.replace(/https:\/\/igirlworld.com\/[a-z][a-z](\/[a-zA-z]+)*/gm, "").length > 0){
//         console.log('passed');
//     }
//     else{
//         console.log('did not pass');
//     }
// }
if (!(l.includes('/zh/') || l.includes('/es/'))) {
    console.log('passed');
}
else {
    console.log('did not pass');
}
