'use strict';

const contentful = require('contentful');
const Linker = require('./linker');
const ReaderError = require('./error');

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
        this.isPreview = config.preview;

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
     * Returns the space for the client.
     * @returns {Promise} The promise instance.
     * @todo - Need to add the Linker to this and parse properly.
     */
    getSpace() {
        return new Linker(this.client.getSpace());
    }

    /**
     * Returns a collection of object (entries or assets).
     * @param {JSON} params - The params to pass to contentful.
     * @param {Bool} isAsset - Whether or not the object is an asset.
     * If false, will look for entries.
     * @returns {Linker} The promise instance.
     */
    _getObjects(params, isAsset) {
        let fn = (isAsset) ? this.client.getAssets : this.client.getEntries;

        return new Linker(fn.call(this, Object.assign({
            include: 10,
        }, params)));
    }

    /**
     * Returns a collection of entries.
     * @param {JSON} params - The params to pass to contentful.
     * @returns {Linker} The promise instance.
     */
    getEntries(params) {
        return this._getObjects(params);
    }

    /**
     * Returns a collection of assets.
     * @param {JSON} params - The params to pass to contentful.
     * @returns {Linker} The promise instance.
     */
    getAssets(params) {
        return this._getObjects(params, true);
    }

    /**
     * Returns an individual object (entry or asset).
     * @param {JSON} params - The params to pass to contentful.
     * @param {Bool} isAsset - Whether or not the object is an asset.
     * If false, will look for entries.
     * @returns {Linker} The promise instance.
     * @todo - Not very readable... (thanks jscs!)
     */
    _getObject(params, isAsset) {
        params = params || {};
        params.limit = 1;
        return new Linker(
            new Promise((resolve, reject) => this._getObjects(params, isAsset)
                .then(objects => (objects && objects.total > 0) ? resolve(objects.items[0]) : reject(new ReaderError('Entry not found.')),
                    err => reject(err))));
    }

    /**
     * Returns an individual entry.
     * @param {JSON} params - The params to pass to contentful.
     * @returns {Linker} The promise instance.
     */
    getEntry(params) {
        return this._getObject(params);
    }

    /**
     * Returns an individual asset.
     * @param {JSON} params - The params to pass to contentful.
     * @returns {Linker} The promise instance.
     */
    getAsset(params) {
        return this._getObject(params, true);
    }

    /**
     * Returns an individual object by id (entry or asset).
     * @param {JSON} params - The params to pass to contentful.
     * @param {Bool} isAsset - Whether or not the object is an asset.
     * If false, will look for entries.
     * @returns {Linker} The promise instance.
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
     * @returns {Linker} The promise instance.
     */
    getEntryById(id, params) {
        return this._getObjectById(id, params);
    }

    /**
     * Returns an individual asset by id.
     * @param {String} id - The id.
     * @returns {Linker} The promise instance.
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
     * @returns {Linker} The promise instance.
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
     * @returns {Linker} The promise instance.
     */
    findEntryByType(contentType, fields, otherParams) {
        return this._findByType(contentType, fields, otherParams, true);
    }

    /**
     * Looks for entries by content type.
     * @param {String} contentType - The type of content to query.
     * @param {JSON} fields - The fields to search by using key => value.
     * @param {JSON} otherParams - Any params that need to override for extra criteria.
     * @returns {Linker} The promise instance.
     */
    findEntriesByType(contentType, fields, otherParams) {
        return this._findByType(contentType, fields, otherParams);
    }

}

module.exports = Wrapper;
