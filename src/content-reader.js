'use strict';

var contentful = require('contentful');

class Controller {
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

    getSpace() {
        return this.client.getSpace();
    }

    getEntries(name) {
        return this.client.getEntries({
            content_type: name
        });
    }

    getEntry(id, noParse) {
        console.log("Getting entry: " + id);
        var raw = this.client.getEntry(id);
        
        return noParse ? raw : raw.then(entry => this.parse(entry), err => this.genericError(err));
    }
    
    getAsset(id, noParse) {
        console.log("Getting asset: " + id);
        var raw = this.client.getAsset(id);
        
        return noParse ? raw : raw.then(asset => this.parse(asset), err => this.genericError(err));
    }
    
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
            reject({msg: 'Bad generic object'});
        });
    }
    
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
                    }
                }
            }
        }
        
        return false;
    }
    
    _deferredRequest(obj, parsed) {
        return new Promise((resolve, reject) => {
            this.getGeneric(obj).then(sub => {
                this._updateParsedRef(parsed, sub);
                resolve(parsed);
            });
        });
    }

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
                        parsed[key].push({id: entry.fields[key][i].sys.id});
                        deferred.push(this._deferredRequest(entry.fields[key][i], parsed));
                    }
                } else if (entry.fields[key].sys) {
                    parsed[key] = {id: entry.fields[key].sys.id};
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
    
    genericError(err) {
        console.log(err);
        return err;
    }
}

module.exports = Controller;
