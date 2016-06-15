'use strict';

let reader;
try {
    reader = require('./src/wrapper');
} catch (err) {
    console.log(err);
    process.exit(1);
}

module.exports = reader;
