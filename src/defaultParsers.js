'use strict';

module.exports = {
    Space: (space, parse) => {

        // Add the important stuff
        space.id = space.sys.id;
        space.type = space.sys.type;

        // clean up before iterating over children
        delete space.sys;

        return space;
    },

    Entry: (entry, parse) => {

        // Add the important stuff
        entry.id = entry.sys.id;
        entry.type = entry.sys.type;

        entry.contentType = entry.sys.contentType.sys.id;

        // Add meta fields
        entry.meta = {
            createdAt: entry.sys.createdAt,
            updatedAt: entry.sys.updatedAt,
            revision: entry.sys.revision,
        };

        // clean up before iterating over children
        delete entry.sys;

        for (let key in entry.fields) {
            if (entry.fields[key] && entry.fields[key].sys) {
                const val = parse(entry.fields[key]);
                if (val) {
                    entry.fields[key] = parse(entry.fields[key]);
                } else {
                    delete entry.fields[key];
                }
            } else if (Array.isArray(entry.fields[key])) {
                for (let i = entry.fields[key].length - 1; i >= 0; i--) {
                    const val = parse(entry.fields[key][i]);
                    if (val) {
                        entry.fields[key][i] = val;
                    } else {
                        entry.fields[key].splice(i, 1);
                    }
                }
            }
        }

        return entry;
    },

    Asset: (asset, parse) => {
        // Add the important stuff
        asset.id = asset.sys.id;
        asset.type = asset.sys.type;

        // Add meta fields
        asset.meta = {
            createdAt: asset.sys.createdAt,
            updatedAt: asset.sys.updatedAt,
            revision: asset.sys.revision,
        };

        // clean up before iterating over children
        delete asset.sys;

        asset.fields.src = asset.fields.file.url;
        delete asset.fields.file;

        return asset;
    },

    Array: (array, parse) => {
        array.meta = {
            total: array.total,
        };
        delete array.sys;
        delete array.skip;
        delete array.limit;
        delete array.includes;
        delete array.total;
        array.items = array.items.map(item => parse(item));

        return array;
    },

    Link: (link, parse) => {},
};
