'use strict';

var parse = require('./parser');

/**
 * Extends `Promise` to allow a parsing before resolving.
 * @param {Promise} o - The original promise instance.
 * @returns {Promise} The promise instance.
 * @example reader.getSomething(params).parse(function(res) { ... });
 */
class Linker {
    constructor(o) {
        o.parse = this.parse;

        return o;
    }
    
    parse(then, error) {
        return this.then(obj => {
            then(parse.it(obj));
        }, err => {
            error(err);
        });
    }
}

module.exports = Linker;
