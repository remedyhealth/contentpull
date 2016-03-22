var c = require('./index');
var reader = new c('k93yc4pkke22', '8df52946b77b1862ea5650ddb4b3b41a3047303d11defbdb0f8cb5fb8c2738b0');

var testGetId = 1;
var testFindEntry = 1;
var testGetEntries = 1;

if (testGetId) {
  reader.getEntryById('4V2Ze2uOZy60k8CeUc0Gsu', { include: 1 }).then(entry => {
    var parsedEntry = reader.parse.it(entry);
      console.log(' ----- Entry ------');
      console.log(parsedEntry);
        console.log('---');
        console.log(parsedEntry.fields.teaserImage);
        console.log('---');
        console.log(parsedEntry.fields.teaserImage.fields.file.details);
        console.log('---');
        console.log(parsedEntry.fields.subCategory);
  }, err => {
      console.log(err);
  })
  .catch(err => {
    console.log(err.stack);
  });
}

if (testFindEntry) {
  reader.findEntryByContentType('home', { current: true }, { include: 3 }).then(entry => {
    var parsedEntry = reader.parse.it(entry);
      console.log(' ----- Home ------');
      console.log(parsedEntry);

      console.log('---');
      console.log(parsedEntry.fields.featured.fields);
      console.log('---');
      console.log(parsedEntry.fields.featured.fields.first.fields.teaserImage);
      console.log('---');
      console.log(parsedEntry.fields.featured.fields.first.fields.teaserImage.fields.file.details);
      console.log('---');
      console.log(parsedEntry.fields.featured.fields.first.fields.subCategory);
      console.log('--------------------------');
  }, err => {
      console.log(err);
  })
  .catch(err => {
    console.log(err.stack);
  });
}

if (testGetEntries) {
  reader.getEntries({ content_type: 'category', include: 0 }).then(entry => {
    var parsedEntry = reader.parse.it(entry);
      console.log(' ----- Categories ------');
      console.log(parsedEntry);

      parsedEntry.items.map( item => {
        console.log('---');
        console.log(item);
      })
      console.log('--------------------------');
  }, err => {
      console.log(err);
  })
  .catch(err => {
    console.log(err.stack);
  });
}
