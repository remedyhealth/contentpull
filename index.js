'use strict'

let puller
try {
  puller = require('./dist/wrapper').default
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    require('babel-register')
    puller = require('./src/wrapper').default
  } else {
    console.log(err)
    process.exit(1)
  }
}

module.exports = puller
