'use strict'

// Dependencies (tests)
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();

// Dependencies (application)
var Wrapper = require('../src/wrapper');
var Linker = require('../src/linker');
var Parser = require('../src/parser');
var ReaderError = require('../src/error');

// Dependencies (local)
var reader;
var rand = Date.now();
var data = require('./mocha.data');

// create reader to use for tests
before(done => {
    reader = new Wrapper(
        'k93yc4pkke22',
        '8df52946b77b1862ea5650ddb4b3b41a3047303d11defbdb0f8cb5fb8c2738b0');
    done();
});

describe('Wrapper', () => {

    describe('getSpace', () => {

    });

    describe('getEntries', () => {

    });

    describe('getAssets', () => {

    });

    describe('getEntry', () => {

    });

    describe('getAsset', () => {

    });

    describe('getEntryById', () => {
        it('should return an single entry when requesting by id', () => {

        });

    });

    describe('getAssetById', () => {

    });

    describe('findEntryByContentType', () => {

    });

    describe('findAssetByContentType', () => {

    });

    describe('getGenericError', () => {

    });

});

describe('Parser', () => {

    describe('one', () => {

    });

    describe('all', () => {

    });

    describe('it', () => {

    });

});

describe('Linker', () => {

    describe('then', () => {

        it('should still run then functions', (done) => {
            return new Linker(Promise.resolve(rand)).then(res => {
                res.should.equal(rand);
                done();
            });
        });

    });

    describe('catch', () => {

        it('should still run catch statements with then statements', (done) => {
            return new Linker(Promise.reject(rand)).then(res => {
                // shouldn't get here...
            }, err => {
                err.should.equal(rand);
                done();
            });
        });

        it('should still run catch statements standalone', (done) => {
            return new Linker(Promise.reject(rand)).catch(res => {
                res.should.equal(rand);
                done();
            });
        });

    });

    describe('parse', () => {

        it('should parse in place of then', (done) => {
            return new Linker(Promise.resolve(data.unparsed)).parse(res => {
                res.should.deep.equal(data.parsed);
                done();
            }, err => {
                console.log(err);
            });
        });

        it('should parse as a chain before then', (done) => {
            return new Linker(Promise.resolve(data.unparsed)).parse().then(res => {
                res.should.deep.equal(data.parsed);
                done();
            }, err => {
                console.log(err);
            });
        });

    });

});

describe('Error', () => {

    describe('ReaderError', () => {

        var err = new ReaderError(rand);

        it('should be of custom type', () => {
            err.constructor.name.should.equal('ReaderError');
        });

        it('should have a message', () => {
            err.message.should.equal(rand);
        });

    });

});
