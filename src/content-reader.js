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

    /**
     * Returns a list of entries.
     * @param {String} name - The entry content type.
     * @returns {Promise} The promise instance.
     * @todo - Add additional parameters, instead of listing all.
     */
    getEntries(name) {
        return this.client.getEntries({
            content_type: name
        });
    }

    /**
     * Returns an individual entry.
     * @param {String} id - The entry id.
     * @param {Bool=} noParse - Ignore parsing.
     * @returns {Promise} The promise instance.
     * @todo - We can do `this.client.getEntries({'sys.id': id})` as well...
     */
    getEntry(id, noParse) {
        console.log("Getting entry: " + id);
        var raw = this.client.getEntry(id);

        return noParse ? raw : raw.then(entry => this.parse(entry), err => this.genericError(err));
    }

    findEntry(contentType, fields) {
        let params = {
            resolveLinks: false,
            limit: 1,
            content_type: contentType
        };

        for (let i in fields) {
            params[`fields.${i}`] = fields[i];
        }

        var self = this;
        return new Promise(function(resolve, reject) {
            self.client.getEntries(params).then(function(entries) {
                if (entries.total === 1 && entries.items.length === 1) {
                    self.parse(entries.items[0]).then(function(parsed) {
                        resolve(parsed);
                    }, function(err) {
                        reject(err);
                    });
                } else {
                    reject(new Error("No entry found"));
                }
            }, function(err) {
                reject(err);
            });
        });
    }

    /**
     * Returns an individual asset.
     * @param {String} id - The asset id.
     * @param {Bool=} noParse - Ignore parsing.
     * @returns {Promise} The promise instance.
     */
    getAsset(id, noParse) {
        console.log("Getting asset: " + id);
        var raw = this.client.getAsset(id);

        return noParse ? raw : raw.then(asset => this.parse(asset), err => this.genericError(err));
    }

    /**
     * Returns a generic object based on the passed in object. This is used to resolve sub-objects in requests.
     * @param {Object} obj - The subobject in a raw request from contentful.
     * @param {String} obj.id - The id of the asset. Needed for the forwarded promise.
     * @param {String} obj.linkType - The type of link. Either 'Asset' or 'Entry'.
     * @returns {Promise} The promise instance.
     */
    getGeneric(obj) {
        if (obj && obj.sys) {
            obj = obj.sys;
        }

        if (obj && obj.id && obj.linkType) {
            if (obj.linkType === 'Entry') {
                return this.getEntry(obj.id);
            } else if (obj.linkType === 'Asset') {
                return this.getAsset(obj.id);
            }
        }

        // otherwise...
        return new Promise((resolve, reject) => {
            reject({
                msg: 'Bad generic object'
            });
        });
    }

    /**
     * Resolved the parsed object recursively with the new object returned.
     * @param {Object} parsed - The currently parsed object. This object nested somewhere should have a reference to obj.id.
     * @param {Object} obj - The new object to replace the referenced object in the parsed parameter.
     * @returns {Bool|undefined} - 
     */
    _updateParsedRef(parsed, obj) {
        for (var field in parsed) {
            if (field === 'id' && parsed[field] === obj.id) {
                return;
            } else if (parsed[field] && parsed[field].id === obj.id) {
                parsed[field] = obj;
                return true;
            } else if (Array.isArray(parsed[field])) {
                for (var i in parsed[field]) {
                    var success = this._updateParsedRef(parsed[field][i], obj);
                    if (success) {
                        return true;
                    } else if (success === undefined) {
                        parsed[field][i] = obj;
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Creates a promise with a handle on the unparsed object, and the currently parsing object.
     * @param {Object} obj - The unparsed object. This will wait for the request to resolve before parsing.
     * @param {Object} parsed - The currently parsed parent object. This should have a reference to obj.id somewhere.
     */
    _deferredRequest(obj, parsed) {
        return new Promise((resolve, reject) => {
            this.getGeneric(obj).then(sub => {
                this._updateParsedRef(parsed, sub);
                resolve(parsed);
            });
        });
    }

    /**
     * Parses a contentful object and resolves sublinks.
     * @param {Object} entry - The raw entry object from contentful.
     * @returns {Promise} The promise instance.
     * @todo - Currently wouldn't work for collections, but we should make a collection promise that wraps a bunch of these up as long as it can manage.
     * @todo - The collection parse would have to account for potentially already resolved fields. This asumsed the response has nothing resolved.
     */
    parse(entry) {

        let promise = new Promise((resolve, reject) => {

            let parsed = {};

            let deferred = [];

            parsed.id = entry.sys.id;
            parsed.createdAt = entry.sys.createdAt;
            parsed.updatedAt = entry.sys.updatedAt;

            for (var key in entry.fields) {
                if (Array.isArray(entry.fields[key])) {
                    parsed[key] = [];
                    for (var i in entry.fields[key]) {
                        parsed[key].push({
                            id: entry.fields[key][i].sys.id
                        });
                        deferred.push(this._deferredRequest(entry.fields[key][i], parsed));
                    }
                } else if (entry.fields[key].sys) {
                    parsed[key] = {
                        id: entry.fields[key].sys.id
                    };
                    deferred.push(this._deferredRequest(entry.fields[key], parsed));
                } else {
                    parsed[key] = entry.fields[key];
                }
            } // end fields loop

            Promise.all(deferred).then(() => {
                resolve(parsed);
            });
        });

        return promise;
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
