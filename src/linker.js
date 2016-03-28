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
        o.parse = function(then, error) {
            return o.then(obj => {
                then(parse.it(obj));
            }, err => {
                error(err);
            });
        };

        return o;
    }
}

module.exports = Linker;
