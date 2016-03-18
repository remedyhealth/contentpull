'use strict';

var contentful = require('contentful');

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
    }

    /**
     * Returns the space for the client.
     * @returns {Object} Details about the currently registered space.
     */
    getSpace() {
        return this.client.getSpace();
    }

    getEntries(params) {
        return this.client.getEntries(params);
    }

    getEntry(params) {
        params = params || {};
        params.limit = 1;
        return this.getEntries(params);
    }

    getEntryById(id) {
        return this.getEntry({
            'sys.id': id
        });
    }

    /**
     * Looks for a specific entry.
     * @param {String} contentType - The type of content to query.
     * @param {Object} fields - The fields to search by.
     * @returns {Promise} The promise instance.
     */
    findEntry(contentType, fields) {

        let params = {
            content_type: contentType
        };

        for (let i in fields) {
            params[`fields.${i}`] = fields[i];
        }

        return this.getEntry(params);
    }

    /**
     * Used to create a generic error should we need one.
     */
    genericError(err) {
        console.log(err);
        return err;
    }
}

module.exports = Controller;
