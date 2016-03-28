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
reader.getEntry('entry-id').then(function (entry) {
    // assuming there is a title attribute
    console.log(entry.title);
});
```

### Advanced Usage

##### Entry

An entry can be retrived using the following:

```
reader.getEntryById('entry-id').then(function (entry) {
    console.log(entry);
}, function (err) {
    console.log('something went wrong');
});
```

We also support the following functions for further entry gathering.

* **getEntries()** - Returns an entry.

##### Assets

An asset can be returned using the following:

```
reader.getAssetById('asset-id').then(function (asset) {
    console.log(asset);
}, function (err) {
    console.log('something went wrong');
});
```

##### Parsing

We have added the ability to parse subobjects should we choose to have a cleaner version of the fields from contentful.

The promise system is extended to include a `parse` method to automatically parse the response.

```
reader.getAssetById('asset-id').parse(function (parsedAsset) {
    console.log(parsedAsset);
}, function (err) {
    console.log('something went wrong');
});
```

We simply replaced `.then(...)` with `.parse(...)` and that parses the response from contentful first.
