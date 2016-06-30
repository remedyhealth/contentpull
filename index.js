'use strict';

let puller;
try {
  puller = require('./dist/wrapper');
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    require('babel-register')
    puller = require('./src/wrapper')
  } else {
    console.log(err);
    process.exit(1);
}

export default puller
