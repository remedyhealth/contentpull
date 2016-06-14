'use strict';

const contentful = require('contentful');
const parse = require('./parser');
const ReaderError = require('./error');
const cloneDeep = require('lodash.clonedeep');
const emptyFn = a => a;

class Wrapper {

    /**
     * Creates a new instance of the content-reader, which wraps around contentful.js
     * @param {String} space - The space to read from.
     * @param {String} accesstoken - The access token provided by contentful.
     * @param {JSON} config - The configuration object.
     * @param {Bool=} config.preview - Whether or not to use the preview mode, or the default host.
     */
    constructor(space, accesstoken, config) {

        // make sure config is set to SOMETHING...
        config = config || {};

        /**
         * Whether or not the client is set up for preview.
         * @type {Bool}
         */
        this.isPreview = !!config.preview;

        /**
         * parser configuration which is key(String) => value(function) pairs.
         * @type {Object}
         */
        this._parsers = {
            space: (space, parse) => {
                return space;
            },
            entry: (entry, parse) => {
                return entry;
            },
            asset: (space, parse) => {
                return asset;
            },
            array: (array, parse) => {
                return array;
            }
        };

        /**
         * The contentful client.
         * @type {CDAClient}
         * @see https://contentful.github.io/contentful.js/contentful/3.3.0/CDAClient.html
         */
        this.client = contentful.createClient({
            space: space,
            accessToken: accesstoken,
            host: (config.preview) ? 'preview.contentful.com' : null,
        });

        return this;
    }

    /**
     * Extends `Promise` to allow a parsing before resolving.
     * @param {Promise} o - The original promise instance.
     * @returns {Promise} The promise instance.
     * @example reader.getSomething(params).parse(function(res) { ... });
     */
    _link(o) {
        o.parse = this._parse;
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
    _parse(then, error) {
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

    /**
     * Returns the space for the client.
     * @returns {Promise} The promise instance.
     */
    getSpace() {
        return this._link(this.client.getSpace());
    }

    /**
     * Returns a collection of object (entries or assets).
     * @param {JSON} params - The params to pass to contentful.
     * @param {Bool} isAsset - Whether or not the object is an asset.
     * If false, will look for entries.
     * @returns {Promise} The promise instance.
     */
    _getObjects(params, isAsset) {
        let fn = (isAsset) ? this.client.getAssets : this.client.getEntries;

        return this._link(fn.call(this, Object.assign({
            include: 10,
        }, params)));
    }

    /**
     * Returns a collection of entries.
     * @param {JSON} params - The params to pass to contentful.
     * @returns {Promise} The promise instance.
     */
    getEntries(params) {
        return this._getObjects(params);
    }

    /**
     * Returns a collection of assets.
     * @param {JSON} params - The params to pass to contentful.
     * @returns {Promise} The promise instance.
     */
    getAssets(params) {
        return this._getObjects(params, true);
    }

    /**
     * Returns an individual object (entry or asset).
     * @param {JSON} params - The params to pass to contentful.
     * @param {Bool} isAsset - Whether or not the object is an asset.
     * If false, will look for entries.
     * @returns {Promise} The promise instance.
     * @todo - Not very readable... (thanks jscs!)
     */
    _getObject(params, isAsset) {
        params = params || {};
        params.limit = 1;
        return this._link(
            new Promise((resolve, reject) => this._getObjects(params, isAsset)
                .then(objects => (objects && objects.total > 0) ? resolve(objects.items[0]) : reject(new ReaderError('Entry not found.')),
                    err => reject(err))));
    }

    /**
     * Returns an individual entry.
     * @param {JSON} params - The params to pass to contentful.
     * @returns {Promise} The promise instance.
     */
    getEntry(params) {
        return this._getObject(params);
    }

    /**
     * Returns an individual asset.
     * @param {JSON} params - The params to pass to contentful.
     * @returns {Promise} The promise instance.
     */
    getAsset(params) {
        return this._getObject(params, true);
    }

    /**
     * Returns an individual object by id (entry or asset).
     * @param {JSON} params - The params to pass to contentful.
     * @param {Bool} isAsset - Whether or not the object is an asset.
     * If false, will look for entries.
     * @returns {Promise} The promise instance.
     */
    _getObjectById(id, params, isAsset) {
        params = params || {};
        params['sys.id'] = id;
        return this._getObject(params, isAsset);
    }

    /**
     * Gets entries by a specified content type
     * @param {String} contentType - The content type to get.
     * @param {Object=} params - Additional params to use.
     */
    getEntriesByType(contentType, params) {
        params = params || {};
        return this.getEntries(Object.assign({
            content_type: contentType,
        }, params));
    }

    /**
     * Returns an individual entry by id.
     * @param {String} id - The id.
     * @returns {Promise} The promise instance.
     */
    getEntryById(id, params) {
        return this._getObjectById(id, params);
    }

    /**
     * Returns an individual asset by id.
     * @param {String} id - The id.
     * @returns {Promise} The promise instance.
     */
    getAssetById(id, params) {
        return this._getObjectById(id, params, true);
    }

    /**
     * Looks for one or more entries by content type.
     * @param {String} contentType - The type of content to query.
     * @param {JSON} fields - The fields to search by using key => value.
     * @param {JSON} otherParams - Any params that need to override for extra criteria.
     * @param {Bool} onlyOne - Whether or not one is expected, or more.
     * @returns {Promise} The promise instance.
     */
    _findByType(contentType, fields, otherParams, onlyOne) {
        let params = {
            content_type: contentType,
        };

        let fn = (onlyOne) ? this.getEntry : this.getEntries;

        for (let i in fields) {
            params[`fields.${i}`] = fields[i];
        }

        params = Object.assign(params, otherParams);

        return fn.call(this, params);
    }

    /**
     * Looks for a specific entry by content type.
     * @param {String} contentType - The type of content to query.
     * @param {JSON} fields - The fields to search by using key => value.
     * @param {JSON} otherParams - Any params that need to override for extra criteria.
     * @returns {Promise} The promise instance.
     */
    findEntryByType(contentType, fields, otherParams) {
        return this._findByType(contentType, fields, otherParams, true);
    }

    /**
     * Looks for entries by content type.
     * @param {String} contentType - The type of content to query.
     * @param {JSON} fields - The fields to search by using key => value.
     * @param {JSON} otherParams - Any params that need to override for extra criteria.
     * @returns {Promise} The promise instance.
     */
    findEntriesByType(contentType, fields, otherParams) {
        return this._findByType(contentType, fields, otherParams);
    }

}

module.exports = Wrapper;
