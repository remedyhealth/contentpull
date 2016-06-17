'use strict';

let puller;
try {
    puller = require('./src/wrapper');
} catch (err) {
    console.log(err);
    process.exit(1);
}

module.exports = puller;
