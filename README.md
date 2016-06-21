# Content-Pull

A contentful.js wrapper that adds simple functions to handle queries and optionally parses data before resolving promises.

### Status

[![npm](https://img.shields.io/npm/v/content-pull.svg?maxAge=86400?style=flat-square)]()
[![GitHub commits](https://img.shields.io/github/commits-since/remedyhealth/content-pull/v1.0.0.svg?maxAge=86400)]()
[![npm](https://img.shields.io/npm/l/content-pull.svg?maxAge=2592000?style=flat-square)]()
[![pull requests](https://img.shields.io/badge/pull%20requests-accepting-brightgreen.svg?style=flat-square)]()

### Reference

See [contentful.js](https://github.com/contentful/contentful.js) for more information as that package represents the base of this one.

### Installation

Include the package locally in your repository.

`npm install content-pull --save`

### Basic Usage

The puller registers a client for communicating with the server. First create an instance of the puller with the following:

```javascript
// The class
var Contentpull = require('content-pull');

// This is your space id (provided by contentful)
var spaceid = 'space-id';

// This is the access token (provided by contentful)
var accessToken = 'abcdefg1234567';

// If preview is true, contentful will run in preview mode
var isPreview = false;

// built-in parsers exist, but you can override your own
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

### Additional Help

If you are viewing this README online, refer to our [wiki](https://github.com/remedyhealth/content-pull/wiki).

If you have cloned or downloaded this repo, please refer to the generated JSDOC articles (`npm run build-doc`).
