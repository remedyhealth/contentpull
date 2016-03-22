'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();

var ContentReader = require('../index');

describe('Content-reader', function () {
  describe(': getEntryById', function () {
    var reader;

    // create reader to use for tests
    before(function (done) {
      reader = new ContentReader(
        'k93yc4pkke22',
        '8df52946b77b1862ea5650ddb4b3b41a3047303d11defbdb0f8cb5fb8c2738b0');
      done();
    });

    it('should return an article when passed the article id', function () {
      let result = reader.getEntryById('4V2Ze2uOZy60k8CeUc0Gsu', { include: 1 });

      return result.then(function (entry) {
        var parsedEntry = reader.parse.it(entry);

        parsedEntry.should.have.deep.property('id', '4V2Ze2uOZy60k8CeUc0Gsu');
        parsedEntry.should.have.property('meta').that.is.an('object');
        parsedEntry.should.have.deep.property('contentType', 'article');
        parsedEntry.should.have.property('fields').that.is.an('object');
      });
    });

  });
});
