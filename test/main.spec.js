'use strict'

// Dependencies (tests)
const chai = require('chai');
chai.should();

// Dependencies (application)
const Wrapper = require('../src/wrapper');
const Linker = require('../src/linker');
const Parser = require('../src/parser');
const ReaderError = require('../src/error');

// Dependencies (local)
let reader;
const rand = Date.now();
const data = require('./mocha.data');
const entryId = '1JlZm1pjX66E44cUyMQ2C2';
const spaceId = 'ww6sikmud9wx';
const qaEntry = 'qaEntry';

// create reader to use for tests
before(done => {
    reader = new Wrapper(
        spaceId,
        '5345757812f5166432dfb3631d418d2f98c19318fe66fd60a6077da9570f77ce');
    done();
});

describe('Wrapper', () => {

    describe('getSpace', () => {

        it('should return data about the registered space', done => {
            return reader.getSpace().then(res => {
                res.sys.id.should.equal(spaceId);
                done();
            });
        });
        
    });

    describe('getEntries', () => {

        it('should return all entries when no criteria is passed', done => {
            return reader.getEntries().then(res => {
                res.should.have.property('total');
                res.total.should.be.above(0);
                done();
            });
        });

        it('should return entries that match criteria specified', done => {
            return reader.getEntries({content_type: qaEntry}).then(res => {
                res.should.have.property('items');
                res.total.should.equal(1);
                res.items[0].sys.contentType.sys.should.have.property('id', qaEntry);
                done();
            });
        });
        
        it('should return nothing if no entries match', done => {
            return reader.getEntries({content_type: 'qaEntryNOPE'}).then(res => {
                // shouldn't get here...
            }, err => {
                err.message.should.be.a('string');
                done();
            });
        });
        
    });

    describe('getAssets', () => {

        it('should return all entries when no criteria is passed', done => {
            return reader.getAssets().then(res => {
                res.should.have.property('total');
                res.total.should.be.above(0);
                done();
            });
        });

        it('should return entries that match criteria specified', done => {
            const assetCriteria = 'image/jpeg';
            return reader.getAssets({'fields.file.contentType': assetCriteria}).then(res => {
                res.should.have.property('items');
                res.total.should.be.above(0);
                res.items[0].fields.file.contentType.should.equal(assetCriteria);
                done();
            }, err => {
                console.log(err);
            });
        });
        
        it('should return nothing if no assets match', done => {
            return reader.getEntries({'fields.file.contentType': 'image/nope'}).then(res => {
                // shouldn't get here...
            }, err => {
                err.message.should.be.a('string');
                done();
            });
        });
    });

    describe('getEntry', () => {
        
        it('should return first entry when no criteria is passed', done => {
            return reader.getEntry().then(res => {
                res.sys.should.have.property('type', 'Entry');
                done();
            });
        });

        it('should return first entry that matches criteria specified', done => {
            return reader.getEntry({content_type: qaEntry}).then(res => {
                res.sys.should.have.property('type', 'Entry');
                done();
            });
        });
        
        it('should return nothing if no entries match', done => {
            return reader.getEntry({content_type: 'qaEntryNOPE'}).then(res => {
                // shouldn't get here...
            }, err => {
                err.message.should.be.a('string');
                done();
            });
        });
    });

    describe('getAsset', () => {
        
        it('should return first asset when no criteria is passed', done => {
            return reader.getAsset().then(res => {
                res.sys.should.have.property('type', 'Asset');
                done();
            });
        });

        it('should return first asset that matches criteria specified', done => {
            const assetCriteria = 'image/jpeg';
            return reader.getAsset({'fields.file.contentType': assetCriteria}).then(res => {
                res.sys.should.have.property('type', 'Asset');
                done();
            });
        });
        
        it('should return nothing if no assets match', done => {
            return reader.getAsset({'fields.file.contentType': 'image/nope'}).then(res => {
                // shouldn't get here...
            }, err => {
                err.message.should.be.a('string');
                done();
            });
        });

    });

    describe('getEntryById', () => {
        
        it('should return an single entry when requesting by id', done => {
            return reader.getEntryById(entryId).then(entry => {
                entry.sys.should.have.property('id');
                entry.sys.id.should.equal(entryId);
                done();
            });
        });

    });

    describe('getAssetById', () => {
        
        it('should return an single asset when requesting by id', done => {
            const assetId = '6JCShApjO0O4CUkUKAKAaS';
            return reader.getAssetById(assetId).then(entry => {
                entry.sys.should.have.property('id');
                entry.sys.id.should.equal(assetId);
                done();
            });
        });
    });

    describe('findEntryByContentType', () => {
    
        it('should return all entries when no criteria is passed', done => {
            return reader.findEntryByContentType(qaEntry).then(res => {
                res.sys.should.have.property('type', 'Entry');
                done();
            });
        });

        it('should return entries that match criteria specified', done => {
            const entryTitle = 'Test Entry';
            return reader.findEntryByContentType(qaEntry, {title: entryTitle}).then(res => {
                res.sys.should.have.property('type', 'Entry');
                res.fields.title.should.equal(entryTitle);
                done();
            });
        });
        
        it('should return nothing if no entries match', done => {
            return reader.findEntryByContentType(qaEntry, {title: 'qaEntryNOPE'}).then(res => {
                // shouldn't get here...
            }, err => {
                err.message.should.be.a('string');
                done();
            });
        });
    });

});

describe('Parser', () => {

    describe('one', () => {
        
        it ('should parse a single object', () => {
            const parsed = Parser.one(data.unparsed);
            parsed.should.deep.equal(data.parsed);
        });
        
        it('should reject an array', () => {
            const parsed = Parser.one(data.unparsedArr);
            parsed.should.deep.equal({});
        });
        
    });

    describe('all', () => {
        
        it('should parse an array', () => {
            const parsed = Parser.all(data.unparsedArr);
            parsed.should.deep.equal(data.parsedArr);
        });
        
        it('should put a single object in the form of a parsed array', () => {
            const parsed = Parser.all(data.unparsed);
            parsed.meta.should.have.property('total').that.equals(1);
            parsed.should.have.property('items').that.is.an('array');
            parsed.items[0].should.deep.equal(data.parsed);
        });
        
    });

    describe('it', () => {

        it('should parse a single object', () => {
            const parsed = Parser.it(data.unparsed);
            parsed.should.deep.equal(data.parsed);
        });

        it('should parse an array', () => {
            const parsed = Parser.it(data.unparsed);
            parsed.should.deep.equal(data.parsed);
        });
        
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
            });
        });

        it('should parse as a chain before then', (done) => {
            return new Linker(Promise.resolve(data.unparsed)).parse().then(res => {
                res.should.deep.equal(data.parsed);
                done();
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
