This module is meant to be interfaced in some was as a replacement for your **Data Access Layer (DAL)**.

### Quick Start

**content-reader** was meant to be extended into your DAL. Consider the following example

```javascript
const content-reader = require('content-reader');

class DataAccessLayer extends content-reader {
    constructor() {
        this._reader = super(
            'space-id',
            'api-key'
        );
    }
    
    getAllPosts() {
        return this.getEntriesByType('post').parse();
    }
    
    getAllAuthors() {
        return this.getEntriesByType('author').parse();
    }
}

module.exports = DataAccessLayer;
```

The above example shows how the content-reader can be used to simplify and parse all
data before it is used in your application.

### Promises

The wrapper (along with contentful.js) uses a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)-driven architecture. All requests will responde with a promise.

Assuming we are in the context of our `DataAccessLayer` from the code-block above, the following can be used to get an entry, where `entryId` is the id of the entry in contentful.

```
getEntryById(entryId) {
    return this._reader.getEntryById(entryId).then((entry) => {
        // assuming there is a title attribute
        console.log(entry.fields.title);
    }, function (err) {
        console.log(err);
    });
}
```

### Parsing

This is where **content-reader** becomes extremely useful. The function in the above example
would simply return example what **contentful.js** would return from an entry request.

This package supports parsing your content to be better aquanted for your use within your application.
**Content-reader** will always return an "augmented" promise, in that it supports an additional feature to
`parse` the data before resolving. This can be achieved in a number of ways:


#### Chaining

This method uses the parser as a chain that runs before resolving.
With this approach, you can have the content resolved, as part of the promise-chain.

```
reader.getEntryById(entryId).parse().then((entry) => {
    // entry is now parsed
});
```

#### Replacement

With the replacement method, you can replace the `.then()` function with `.parse()`
and it will functionaly work the same, only this time you will have parsed data.

```
reader.getEntryById(entryId).parse((entry) => {
    // entry is now parsed
});
```

