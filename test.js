'use strict';

var ContentReader = require('./index');
var reader = new ContentReader('cyn2ssr0iqx0',
    '1157ce98f62ebccc473a3fe59397c84fc685e5f1b7630ad56da07ccba3be50ca');

//reader.getEntryById('17Qyza4gHuei84qcUaSOgs', {
//    include: 1
//}).then(entry => {
//    console.log(entry);
//}, err => {
//    console.log(err);
//});

let t = reader.getEntryById('17Qyza4gHuei84qcUaSOgs', { include: 1 });

t.parse(entry => {
    console.log(entry);
}, err => {
    console.log(err);
});

//var t = new Promise((resolve, reject) => {
//    resolve({hi:true});
//});
//
//t.parse(obj => {
//    console.log('hello');
//    console.log(obj);
//}, err => {
//    console.log(err);
//});