# Content Reader

This package is a contentful.js wrapper. Use it to assist with getting entires, assets, and resolve nested object in requests.

### Reference

See [contentful.js](https://github.com/contentful/contentful.js) for more information as this system wraps around contentful's.

### Installation

Include the package locally in your repository.

`npm install @rhm/content-reader --save`

### Basic Usage

The reader registers a client for communicating with the server. First create an instance of the reader with the following:

```
// The class
var contentReader = require('@rhm/content-reader');

// This is your space id (provided by contentful)
var spaceid = 'space-id';

// This is the access token (provided by contentful)
var accessToken = 'abcdefg1234567';

// If debug is true, contentful will run in preview mode
var isDebug = false;

// The instance of the reader
var reader = new contentReader(spaceid, accessToken, isDebug);
```

### Promises

The wrapper (along with contentful.js) uses a promise-driven architecture. All requests will responde with a promise which can be used to wait for the response to pass or fail.

Assuming our `reader` has been set up from the code-block above, the following can be used to get an entry, where `entry-id` is the id of the entry in contentful.

```
reader.getEntryById('entry-id').then(function (entry) {
    // assuming there is a title attribute
    console.log(entry.title);
}, function (err) {
    console.log(err);
});
```

### Environment Variables (test)

If you choose to unit test with `npm test`, you will need to set environment variables we all as be sure you set up your spaces accurately.

* **SPACE_ID** - The space id you will be testing against.
* **PROD_KEY** - The production access api key provided by contentful.
* **PREV_KEY** - The preview access api key provided by contentful.
* **ENTRY_TYPE** - The entry content type id that will be used for testing
** NOTE: This entry type should have two fields: `title` (short text), and `ref` (single reference).
* **ENTRY_ID** - The id of the specific entry to request from contentful.
* **ENTRY_TITLE** - The title of the entry provided from `ENTRY_ID`.
* **ASSET_TYPE** - The asset type uploaded to your space.

Essentially this space will be used to QA your build. It is highly recommended to use a standalone space that wont break to maintain testing reliability.

The space needs only one content type with two fields:

* **title** (`short text`) - Used to match locally with `ENTRY_TITLE`.
* **ref** (`single reference`) - Used to test circular dependencies.

You will also be required to add a single asset. This is required to test gathering assets from contentful.

Set the `ASSET_TYPE` variable to match the type of the image (i.e. **image/jpeg** or **image/png**).

### Additional Help

Please refer to the generated JSDOC articles (`gulp doc`).
