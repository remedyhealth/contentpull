'use strict';

const parse = require('./parser');
const cloneDeep = require('lodash.clonedeep');

// This is used simply as a helper for the parse callback/chain
const emptyFn = a => a;

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

    /**
     * Parses the response before returning.
     * @param {function} then - The callback when a successfull response is made.
     * @param {function} error - The failed callback function.
     *
     * @example
     * // Get entry with parse callback
     * reader.getEntryById('entry-id').parse(res => { ... });
     *
     * // Get entry with parse chain
     * reader.getEntryById('entry-id').parse().then(res => { ... });
     */
    parse(then, error) {
        then = then || emptyFn;

        return this.then(obj => {
            try {
                return then(parse.it(cloneDeep(obj)));
            } catch (e) {
                if (error) {
                    return error(e);
                } else {
                    throw e;
                }
            }
        });
    }
}

module.exports = Linker;
