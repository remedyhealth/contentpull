# Contentpull

[![Greenkeeper badge](https://badges.greenkeeper.io/remedyhealth/contentpull.svg)](https://greenkeeper.io/)

A contentful.js wrapper that adds simple functions to handle queries and optionally parses data before resolving promises.

### Status

[![npm](https://img.shields.io/npm/v/contentpull.svg?maxAge=0&style=flat)](https://www.npmjs.com/package/contentpull)
[![Travis](https://travis-ci.org/remedyhealth/contentpull.svg?branch=master)](https://travis-ci.org/remedyhealth/contentpull)
[![Coverage Status](https://coveralls.io/repos/github/remedyhealth/contentpull/badge.svg?branch=master)](https://coveralls.io/github/remedyhealth/contentpull?branch=master)
[![Dependency Status](https://david-dm.org/remedyhealth/contentpull.svg)](https://david-dm.org/remedyhealth/contentpull)
[![devDependency Status](https://david-dm.org/remedyhealth/contentpull/dev-status.svg)](https://david-dm.org/remedyhealth/contentpull#info=devDependencies)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![npm](https://img.shields.io/npm/l/contentpull.svg?maxAge=0&style=flat)](https://raw.githubusercontent.com/remedyhealth/contentpull/master/LICENSE)
[![pull requests](https://img.shields.io/badge/pull%20requests-accepting-brightgreen.svg?style=flat)](https://github.com/remedyhealth/contentpull/fork)

### Reference

See [contentful.js](https://github.com/contentful/contentful.js) for more information as that package represents the base of this one.

### Installation

Include the package locally in your repository.

`npm install contentpull --save`

### Basic Usage

> To see an interactive guide, visit our [tonic](https://tonicdev.com/mrsteele/contentpull) notebook.

The puller registers a client for communicating with the server. First create an instance of the puller with the following:

```javascript
// The class
var Contentpull = require('contentpull');

// This is your space id (provided by contentful)
var spaceid = 'space-id';

// This is the access token (provided by contentful)
var accessToken = 'abcdefg1234567';

// If preview is true, contentful will run in preview mode
var isPreview = false;

// built-in parsers exist, but you can override any of them
var parsers = {
    // choose the content type parser you want to override
    Array: function (arr, parser) {
        // edit the passed object directy
        delete arr.sys;
        arr.items.map(item => parser(item));
    }
};

// The instance of the puller
var puller = new Contentpull(spaceid, accessToken, {
    preview: isPreview,
    parsers: parsers
});
```

### Writing plugins

You can create your own plugins using the static `.use` function.

All of the following examples are valid for writing extensions to be used in Contentpull

```javascript

// the augmentation
function getEntriesByContentType() {
    this.getEntriesByType.apply(this, arguments);
}

/*

Each example allows the following to work:

puller.getEntriesByContentType('books');

*/

/**
 * {String} name - The function name.
 * {function} fn - The function reference.
 */
Contentpull.use('getEntriesByContentType', getEntriesByContentType);

/**
 * {function} fn - The function reference (must be named).
 */
Contentpull.use(getEntriesByContentType)

/**
 * {Object} args - The arguments.
 * {String} args.name - The function name.
 * {function} args.fn - The function reference.
 */
Contentpull.use({
    name: 'getEntriesByContentType',
    fn: getEntriesByContentType
});
```

Please take a look at our example
[contentpull-backup](https://github.com/remedyhealth/contentpull-backup).

### Additional Help

If you are viewing this README online, refer to our [wiki](https://github.com/remedyhealth/contentpull/wiki).

If you have cloned or downloaded this repo, please refer to the generated JSDOC articles (`npm run build-doc`).

### LICENSE

MIT
