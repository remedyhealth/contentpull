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

        if (obj && obj.sys && (obj.sys.type !== 'Array' || obj.sys.type !== 'Link')) {
            parsed.id = obj.sys.id;
            parsed.meta = {
                createdAt: obj.sys.createdAt,
                updatedAt: obj.sys.updatedAt,
                revision: obj.sys.revision,
            };
            if (obj.sys.contentType) {
                parsed.contentType = obj.sys.contentType.sys.id;
            }

            parsed.fields = {};
            for (let key in obj.fields) {
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
        let parsed = {
            meta: {
                total: 0
            },
            items: []
        };

        if (obj && obj.sys && obj.sys.type === 'Array') {
            parsed.meta.total = obj.total;
            parsed.meta.skip = obj.skip;
            parsed.meta.limit = obj.limit;
            parsed.items = obj.items.map(item => this.it(item));
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
            return (obj.sys.type === 'Array') ? this.all(obj) : this.one(obj);
        } else {
            return {};
        }
    }
}

module.exports = new Parser();
