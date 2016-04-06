'use strict';

/**
 * @class
 * Parses objects received by contentful.
 */
class Parser {

    /**
     * Returns an individual object parsed.
     * @param {JSON} obj - An unparsed object.
     * @param {String[]} ignore - ids to ignore.
     * @returns {JSON} The parsed object.
     */
    one(obj, ignore) {
        ignore = ignore || [];
        let parsed = {};

        if (obj && obj.sys && obj.sys.type !== 'Array' && obj.sys.type !== 'Link') {

            // Ignore redundancies
            parsed.id = obj.sys.id;
            if (ignore.indexOf(obj.sys.id) !== -1) {
                return parsed;
            }

            ignore.push(parsed.id);

            // Add the important stuff
            parsed.type = obj.sys.type;

            // Add meta fields
            if (obj.sys.type !== 'Space') {
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
                        parsed.fields[key] = this.it(obj.fields[key], ignore);
                    } else if (Array.isArray(obj.fields[key])) {
                        parsed.fields[key] = [];
                        for (let sub of obj.fields[key]) {
                            parsed.fields[key].push(this.it(sub, ignore));
                        }
                    } else {
                        parsed.fields[key] = obj.fields[key];
                    }
                }
            }
        }

        return parsed;
    }

    /**
     * Returns an individual object parsed.
     * @param {JSON} obj - An unparsed collection of objects.
     * @param {String[]} ignore - ids to ignore.
     * @returns {JSON} The parsed object.
     */
    all(obj, ignore) {

        ignore = ignore || [];

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
            parsed.items = obj.items.map(item => this.it(item, ignore));
        } else if (obj && obj.sys && obj.sys.type) {
            parsed.meta.total = 1;
            parsed.items.push(this.it(obj, ignore));
        }

        return parsed;
    }

    /**
     * If the contentful object might be one or more, use this to properly route.
     * @param {JSON} obj - An unparsed collection of objects, or an individual object.
     * @param {String[]} ignore - ids to ignore.
     * @returns {JSON} The parsed object.
     */
    it(obj, ignore) {
        ignore = ignore || [];
        if (obj && obj.sys) {

            // if it is an array, use
            return (obj.sys.type === 'Array') ? this.all(obj, ignore) : this.one(obj, ignore);
        } else {

            // not valid, return an empty object
            return {};
        }
    }
}

module.exports = new Parser();
