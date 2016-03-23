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

    it('should return the list of articles for a subCategory', function () {
      // we need to know the subCategory id to do the query
      let subCatId = '31ogjk5nBS4Euo0wM8OKus';
      let result = reader.getEntries({
        content_type: 'article',
        'fields.subCategory.sys.id': subCatId,
        include: 1,
      });

      return result.then(function (entry) {
        var parsedEntry = reader.parse.it(entry);

        parsedEntry.should.have.property('meta').that.is.an('object');
        parsedEntry.should.have.deep.property('meta.total').that.is.at.least(1);
        parsedEntry.should.have.deep.property('meta.skip', 0);
        parsedEntry.should.have.deep.property('meta.limit', 100);
        parsedEntry.should.have.property('items').that.is.an('Array');
        parsedEntry.should.have.deep.property('items[0].contentType', 'article');
        parsedEntry.should.have.deep.property('items[0].fields.slug', 'a-guide-to-good-posture');
        parsedEntry.should.have.deep.property('items[0].fields.teaserImage');

        let teaserImage = parsedEntry.items[0].fields.teaserImage;
        teaserImage.should.have.deep.property('fields.file.details.image.width', 988);
      });
    });

    it('should return the list of articles for a category', function () {
      // search for category using slug
      let catSlug = 'fitness';
      return reader.findEntryByContentType('category', { slug: catSlug }, { include: 0 })
      .then(category => {
        // we have category, now search for subCategories for this Category
        return reader.getEntries({
          content_type: 'subCategory',
          'fields.category.sys.id': category.sys.id,
          include: 0,
        });
      })
      .then(subCategories => {
        // we have subCategories, now get all their ids for the query
        let subCatIds = subCategories.items.map(subCat => subCat.sys.id);

        let result = reader.getEntries({
          content_type: 'article',
          'fields.subCategory.sys.id[in]': subCatIds.join(','),
          include: 1,
        });

        return result.then(function (entry) {
          var parsedEntry = reader.parse.it(entry);

          parsedEntry.should.have.property('meta').that.is.an('object');
          parsedEntry.should.have.deep.property('meta.total').that.is.at.least(1);
          parsedEntry.should.have.deep.property('meta.skip', 0);
          parsedEntry.should.have.deep.property('meta.limit', 100);
          parsedEntry.should.have.property('items').that.is.an('Array');
          parsedEntry.should.have.deep.property('items[0].contentType', 'article');
          parsedEntry.should.have.deep.property('items[0].fields.slug', 'a-guide-to-good-posture');
          parsedEntry.should.have.deep.property('items[0].fields.teaserImage');

          let teaserImage = parsedEntry.items[0].fields.teaserImage;
          teaserImage.should.have.deep.property('fields.file.details.image.width', 988);
        });
      });
    });

  });
});
