'use strict';

/**
 * @class
 * Parses objects received by contentful.
 */
class Parser {

    /**
     * Returns an individual object parsed.
     * @param {Object} obj - An unparsed object.
     * @returns {Object} The parsed object.
     */
    one(obj) {
        let parsed = {};

        if (obj && obj.sys && obj.sys.type !== 'Array' && obj.sys.type !== 'Link') {

            // Add the important stuff
            parsed.id = obj.sys.id;
            parsed.type = obj.sys.type;

            // Add meta fields
            parsed.meta = {
                createdAt: obj.sys.createdAt,
                updatedAt: obj.sys.updatedAt,
                revision: obj.sys.revision,
            };

            // If it is an entry, probably can add the type
            if (obj.sys.contentType) {
                parsed.contentType = obj.sys.contentType.sys.id;
            }

            // All fields need to be parsed and added
            parsed.fields = {};
            for (let key in obj.fields) {
                
                // It is either going to be a nested object, array, or raw field
                if (obj.fields[key] && obj.fields[key].sys) {
                    parsed.fields[key] = this.it(obj.fields[key]);
                } else if (Array.isArray(obj.fields[key])) {
                    parsed.fields[key] = [];
                    for (let sub of obj.fields[key]) {
                        parsed.fields[key].push(this.it(sub));
                    }
                } else {
                    parsed.fields[key] = obj.fields[key];
                }
            }
        }

        return parsed;
    }

    /**
     * Returns an individual object parsed.
     * @param {Object} obj - An unparsed collection of objects.
     * @returns {Object} The parsed object.
     */
    all(obj) {

        // Create the parsed JSON structure
        let parsed = {
            meta: {
                total: 0
            },
            items: []
        };

        // If there are many, parse them and populate them
        // If there is only one, go ahead and add it
        if (obj && obj.sys && obj.sys.type === 'Array') {
            parsed.meta.total = obj.total;
            parsed.items = obj.items.map(item => this.it(item));
        } else if (obj && obj.sys && obj.sys.type) {
            parsed.meta.total = 1;
            parsed.items.push(this.it(obj));
        }

        return parsed;
    }

    /**
     * If the contentful object might be one or more, use this to properly route.
     * @param {Object} obj - An unparsed collection of objects, or an individual object.
     * @returns {Object} The parsed object.
     */
    it(obj) {
        if (obj && obj.sys) {
            
            // if it is an array, use
            return (obj.sys.type === 'Array') ? this.all(obj) : this.one(obj);
        } else {
            
            // not valid, return an empty object
            return {};
        }
    }
}

module.exports = new Parser();
