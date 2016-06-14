This tutorial will assist you in writing parsers.

### What is a parser?

A parser is a function that is run through an object to "clean" it. Contentful
currently has 5 different types of objects that can be accepted from the api:

* Space
* Entry
* Asset
* Array
* Link

### Example

Each parser should accept the two arguments: The object to be parsed, and an
instance of the parser callback.

Consider the default `Array` object that is received from Contentful:

```JSON
{
  "sys": {
    "type": "Array"
  },
  "total": 1,
  "skip": 0,
  "limit": 1,
  "items": [
    {
      "pretend": "this exists"
    }
  ]
}
```

Using the following example, we can clean up the object:

```javascript
const arrayParser = (array, parse) => {
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
};
```

Running through the parser, now the object will be considerably cleaner

```JSON
{
  "meta": {
    "total": 1
  }
  "items": [
    {
      "pretend": "this exists",
      "note": "This also gets parsed because of the 'array.items.map...' line."
    }
  ]
}
```

Just be sure that you assign this parser in the configuration:

```Javascript
const reader = new ContentReader('spaceid', 'apikey', {
    parsers: {
        'Array': arrayParser
    }
});
```
