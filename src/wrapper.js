'use strict';

var contentful = require('contentful');
var parse = require('./parser');

class Controller {

    /**
     * Creates a new instance of the content-reader, which wraps around contentful.js
     * @param {String} space - The space to read from.
     * @param {String} accesstoken - The access token provided by contentful.
     * @param {Bool=} debug - Whether or not to use the preview mode, or the default host.
     */
    constructor(space, accesstoken, debug) {

        let params = {
            space: space,
            accessToken: accesstoken
        };

        if (debug) {
            params.host = 'preview.contentful.com';
        }

        this.client = contentful.createClient(params);
        this.parse = parse;
    }

    /**
     * Returns the space for the client.
     * @returns {Object} Details about the currently registered space.
     */
    getSpace() {
        return this.client.getSpace();
    }

    /**
     * Returns a collection of object (entries or assets).
     * @param {JSON} params - The params to pass to contentful.
     * @param {Bool} isAsset - Whether or not the object is an asset. If false, will look for entries.
     * @returns {Promise} The promise instance.
     */
    _getObjects(params, isAsset) {
        let fn = (isAsset) ? this.client.getAssets : this.client.getEntries;

        return fn(params);
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
     * @param {Bool} isAsset - Whether or not the object is an asset. If false, will look for entries.
     * @returns {Promise} The promise instance.
     */
    _getObject(params, isAsset) {
        params = params || {};
        params.limit = 1;
        return new Promise((resolve, reject) => {
            this._getObjects(params, isAsset).then(objects => {
                if (objects && objects.total === 1) {
                    resolve(objects.items[0]);
                } else {
                    reject(new Error("Entry not found."));
                }
            }, this.genericError);
        });
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
     * @param {Bool} isAsset - Whether or not the object is an asset. If false, will look for entries.
     * @returns {Promise} The promise instance.
     */
    _getObjectById(id, params, isAsset) {
      params = params || {};
      params['sys.id'] = id;
      return this._getObject(params, isAsset);
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
     * Looks for a specific object by content type (entry or asset).
     * @param {String} contentType - The type of content to query.
     * @param {Object} fields - The fields to search by.
     * @returns {Promise} The promise instance.
     */
    _findObjectByContentType(contentType, fields, otherParams, isAsset) {

        let params = {
            content_type: contentType
        };

        for (let i in fields) {
            params[`fields.${i}`] = fields[i];
        }

        params = Object.assign(params, otherParams);

        return this._getObject(params, isAsset);
    }

    /**
     * Looks for a specific entry by content type.
     * @param {String} contentType - The type of content to query.
     * @param {Object} fields - The fields to search by.
     * @returns {Promise} The promise instance.
     */
    findEntryByContentType(contentType, fields, params) {
        return this._findObjectByContentType(contentType, fields, params);
    }

    /**
     * Looks for a specific asset by content type.
     * @param {String} contentType - The type of content to query.
     * @param {Object} fields - The fields to search by.
     * @returns {Promise} The promise instance.
     */
    findAssetByContentType(contentType, fields) {
        return this._findObjectByContentType(contentType, fields, {}, true);
    }

    /**
     * Used to create a generic error should we need one.
     */
    genericError(err) {
        console.log(err.stack);
        return err;
    }
}

module.exports = Controller;
