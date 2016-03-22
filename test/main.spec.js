'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();

var ContentReader = require('../index');

describe('Content reader - hooked up to contentful', function () {
  var reader;

  // create reader to use for tests
  before(function (done) {
    reader = new ContentReader(
      'k93yc4pkke22',
      '8df52946b77b1862ea5650ddb4b3b41a3047303d11defbdb0f8cb5fb8c2738b0');
    done();
  });

  describe(': getEntryById', function () {
    it('should return an article when passed the article id', function () {
      let result = reader.getEntryById('4V2Ze2uOZy60k8CeUc0Gsu', { include: 1 });

      return result.then(function (entry) {
        var parsedEntry = reader.parse.it(entry);

        parsedEntry.should.have.deep.property('id', '4V2Ze2uOZy60k8CeUc0Gsu');
        parsedEntry.should.have.property('meta').that.is.an('object');
        parsedEntry.should.have.deep.property('contentType', 'article');
        parsedEntry.should.have.property('fields').that.is.an('object');
        parsedEntry.should.have.deep.property('fields.teaserImage');
        parsedEntry.should.have.deep.property('fields.teaserImage.fields.file.details');
      });
    });

  });

  describe(': findEntryByContentType', function () {
    it('should return the home content type when passed the query for home', function () {
      let result = reader.findEntryByContentType('home', { current: true }, { include: 3 });

      return result.then(function (entry) {
        var parsedEntry = reader.parse.it(entry);

        parsedEntry.should.have.deep.property('contentType', 'home');
        parsedEntry.should.have.property('meta').that.is.an('object');
        parsedEntry.should.have.property('fields').that.is.an('object');
        parsedEntry.should.have.deep.property('fields.current').that.is.true;
        parsedEntry.should.have.deep.property('fields.featured').that.is.an('object');
        parsedEntry.should.have.deep.property('fields.featured.fields.first').that.is.an('object');
        parsedEntry.should.have.deep.property('fields.featured.fields.first.fields.teaserImage');
      });
    });

  });

  describe(': getEntries', function () {
    it('should return the category content type when passed the query for categories', function () {
      let result = reader.getEntries({ content_type: 'category', include: 0 });

      return result.then(function (entry) {
        var parsedEntry = reader.parse.it(entry);

        parsedEntry.should.have.property('meta').that.is.an('object');
        parsedEntry.should.have.deep.property('meta.total', 3);
        parsedEntry.should.have.deep.property('meta.skip', 0);
        parsedEntry.should.have.deep.property('meta.limit', 100);
        parsedEntry.should.have.property('items').that.is.an('Array');
        parsedEntry.should.have.deep.property('items[0].contentType', 'category');
      });
    });

  });
});
