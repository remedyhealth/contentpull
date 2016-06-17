# Content-Pull

This package is a contentful.js wrapper. Use it to assist with getting entires, assets, and resolve nested object in requests.

### Reference

See [contentful.js](https://github.com/contentful/contentful.js) for more information as this system wraps around contentful's.

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
    preview: isPreview
});
```

### Additional Help

If you are viewing this README online, refer to our [wiki](https://github.com/remedyhealth/content-pull/wiki).

If you have cloned or downloaded this repo, please refer to the generated JSDOC articles (`npm run build-doc`).
