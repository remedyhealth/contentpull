'use strict'

// Dependencies (tests)
const chai = require('chai');
chai.should();

// Dependencies (application)
const Wrapper = require('../src/wrapper');
const Linker = require('../src/linker');
const Parser = require('../src/parser');
const ReaderError = require('../src/error');
const cloneDeep = require('lodash.clonedeep');
const url = require('url');

// Dependencies (local)
let reader;
const data = require('./mocha.data');
const Mitm = require('mitm');
const mitm = Mitm();

// mock data
const mockData = require('./stubs');
const entryType = mockData.entry.sys.contentType.sys.id;
const assetType = mockData.asset.fields.file.contentType;
const entryId = mockData.entry.sys.id;
const assetId = mockData.asset.sys.id;
const entryTitle = mockData.entry.fields.title;
const rand = Date.now();

// create reader and mock server to use for tests
before(done => {
    
    mitm.on('request', (req, res) => {
        
        const $url = url.parse(req.url);
        let pathParts = $url.pathname.split('/');
        pathParts.shift();
        const part = pathParts[2];
        
        function end(data) {
            return res.end(JSON.stringify(data));
        }
        
        if (req.url.indexOf('qaEntryNOPE') > -1 || req.url.indexOf('image%2Fnope') > -1) {
            res.statusCode = 400;
            return end(mockData.error);
        } else if (req.url.indexOf('emptyArray') > -1) {
            return end(mockData.emptyArray);
        } else if (part === 'entries') {
            return end(mockData.entries);
        } else if (part === 'assets') {
            return end(mockData.assets);
        } else {
            return end(mockData.space);
        }
    });
    
    reader = new Wrapper(
        'spaceid',
        'prodkey');

    // Throwaway
    new Wrapper(
        'spaceid',
        'prevkey',
        true);

    done();
});

// clean up the mock server
after(() => {
    //xhr.restore();
});

describe('Wrapper', () => {

    describe('getSpace', () => {

        it('should return data about the registered space', done => {
            return reader.getSpace().then(res => {
                res.sys.id.should.equal(mockData.space.sys.id);
                done();
            }, err => {
                done(err);
            }).catch(err => {
                done(err);
            });
        });

    });

    describe('getEntries', () => {

        it('should return all entries when no criteria is passed', done => {
            return reader.getEntries().then(res => {
                res.should.have.property('total');
                res.total.should.be.above(0);
                done();
            }, err => {
                done(err);
            }).catch(err => {
                done(err);
            });
        });

        it('should return entries that match criteria specified', done => {
            return reader.getEntries({
                content_type: entryType
            }).then(res => {
                res.should.have.property('items');
                res.total.should.equal(1);
                res.items[0].sys.contentType.sys.should.have.property('id', entryType);
                done();
            }, err => {
                done(err);
            }).catch(err => {
                done(err);
            });
        });

        it('should return nothing if no entries match', done => {
            return reader.getEntries({
                content_type: 'qaEntryNOPE'
            }).then(res => {
                done(new Error("Expected an error..."));
            }, err => {
                err.message.should.be.a('string');
                done();
            }).catch(err => {
                done(err);
            });
        });

    });

    describe('getAssets', () => {

        it('should return all assets when no criteria is passed', done => {
            return reader.getAssets().then(res => {
                res.should.have.property('total');
                res.total.should.be.above(0);
                done();
            }, err => {
                done(err);
            }).catch(err => {
                done(err);
            });
        });

        it('should return assets that match criteria specified', done => {
            return reader.getAssets({
                'fields.file.contentType': assetType
            }).then(res => {
                res.should.have.property('items');
                res.total.should.be.above(0);
                res.items[0].fields.file.contentType.should.equal(assetType);
                done();
            }, err => {
                done(err);
            }).catch(err => {
                done(err);
            });
        });

        it('should return nothing if no assets match', done => {
            return reader.getEntries({
                'fields.file.contentType': 'image/nope'
            }).then(res => {
                done(new Error("Expected an error..."));
            }, err => {
                err.message.should.be.a('string');
                done();
            }).catch(err => {
                done(err);
            });
        });
    });

    describe('getEntry', () => {

        it('should return first entry when no criteria is passed', done => {
            return reader.getEntry().then(res => {
                res.sys.should.have.property('type', 'Entry');
                done();
            }, err => {
                done(err);
            }).catch(err => {
                done(err);
            });
        });

        it('should return first entry that matches criteria specified', done => {
            return reader.getEntry({
                content_type: entryType
            }).then(res => {
                res.sys.should.have.property('type', 'Entry');
                done();
            }, err => {
                done(err);
            }).catch(err => {
                done(err);
            });
        });

        it('should return nothing if no entries match', done => {
            return reader.getEntry({
                content_type: 'qaEntryNOPE'
            }).then(res => {
                done(new Error("Expected an error..."));
            }, err => {
                err.message.should.be.a('string');
                done();
            }).catch(err => {
                done(err);
            });
        });
    });

    describe('getAsset', () => {

        it('should return first asset when no criteria is passed', done => {
            return reader.getAsset().then(res => {
                res.sys.should.have.property('type', 'Asset');
                done();
            }, err => {
                done(err);
            }).catch(err => {
                done(err);
            });
        });

        it('should return first asset that matches criteria specified', done => {
            const assetCriteria = assetType;
            return reader.getAsset({
                'fields.file.contentType': assetCriteria
            }).then(res => {
                res.sys.should.have.property('type', 'Asset');
                done();
            }, err => {
                done(err);
            }).catch(err => {
                done(err);
            });
        });

        it('should return nothing if no assets match', done => {
            return reader.getAsset({
                'fields.file.contentType': 'image/nope'
            }).then(res => {
                done(new Error("Expected an error..."));
            }, err => {
                err.message.should.be.a('string');
                done();
            }).catch(err => {
                done(err);
            });
        });

    });

    describe('getEntryById', () => {

        it('should return a single entry when requesting by id', done => {
            return reader.getEntryById(entryId).then(entry => {
                entry.sys.should.have.property('id');
                entry.sys.id.should.equal(entryId);
                done();
            }, err => {
                done(err);
            }).catch(err => {
                done(err);
            });
        });

    });

    describe('getAssetById', () => {

        it('should return a single asset when requesting by id', done => {
            return reader.getAssetById(assetId).then(entry => {
                entry.sys.should.have.property('id');
                entry.sys.id.should.equal(assetId);
                done();
            }, err => {
                done(err);
            }).catch(err => {
                done(err);
            });
        });
    });

    describe('getEntriesByType', () => {
        it('should return entries by content type', done => {
            return reader.getEntriesByType(entryType).then(entries => {
                entries.should.have.property('items');
                entries.total.should.be.above(0);
                done();
            }, err => {
                done(err);
            }).catch(err => {
                done(err);
            });
        });
    });

    describe('findEntryByType', () => {

        it('should return all entries when no criteria is passed', done => {
            return reader.findEntryByType(entryType).then(res => {
                res.sys.should.have.property('type', 'Entry');
                done();
            }, err => {
                done(err);
            }).catch(err => {
                done(err);
            });
        });

        it('should return entries that match criteria specified', done => {
            return reader.findEntryByType(entryType, {
                title: entryTitle
            }).then(res => {
                res.sys.should.have.property('type', 'Entry');
                res.fields.title.should.equal(entryTitle);
                done();
            }, err => {
                done(err);
            }).catch(err => {
                done(err);
            });
        });

        it('should return nothing if no entries match', done => {
            return reader.findEntryByType(entryType, {
                title: 'emptyArray'
            }).then(res => {
                done(new Error("Expected an error..."));
            }, err => {
                err.message.should.be.a('string');
                done();
            }).catch(err => {
                done(err);
            });
        });
    });

    describe('findEntriesByType', () => {

        it('should return all entries that match the criteria', done => {
            return reader.findEntriesByType(entryType, {
                title: entryTitle
            }).then(res => {
                res.should.have.property('items');
                res.total.should.be.above(0);
                done();
            }, err => {
                done(err);
            }).catch(err => {
                done(err);
            });
        });

        it('should return nothing if no entries match', done => {
            return reader.findEntriesByType(entryType, {
                title: 'emptyArray'
            }).then(res => {
                res.total.should.equal(0);
                done();
            }, err => {
                done(err);
            }).catch(err => {
                done(err);
            });
        });
    });

});

describe('Parser', () => {

    describe('one', () => {

        it('should parse a single object', () => {
            const parsed = Parser.one(cloneDeep(data.unparsed));
            parsed.should.deep.equal(data.parsed);
        });

        it('should reject an array', () => {
            const parsed = Parser.one(cloneDeep(data.unparsedArr));
            parsed.should.deep.equal(data.unparsedArr);
        });

    });

    describe('all', () => {

        it('should parse an array', () => {
            const parsed = Parser.all(cloneDeep(data.unparsedArr));
            parsed.should.deep.equal(data.parsedArr);
        });

        it('should put a single object in the form of a parsed array', () => {
            const parsed = Parser.all(cloneDeep(data.unparsed));
            parsed.meta.should.have.property('total').that.equals(1);
            parsed.should.have.property('items').that.is.an('array');
            parsed.items[0].should.deep.equal(data.parsed);
        });
        
        it('should not interfere with regular objects', () => {
            const obj = {test: {is: true}};
            const parsed = Parser.all(obj);
            parsed.should.deep.equal(obj);
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

        it('should still run then functions', done => {
            return new Linker(Promise.resolve(rand)).then(res => {
                res.should.equal(rand);
                done();
            }).catch(err => {
                done(err);
            });
        });

    });

    describe('catch', () => {

        it('should still run catch statements with then statements', done => {
            return new Linker(Promise.reject(rand)).then(res => {
                // shouldn't get here...
            }, err => {
                err.should.equal(rand);
                done();
            }).catch(err => {
                done(err);
            });
        });

        it('should still run catch statements standalone', done => {
            return new Linker(Promise.reject(rand)).catch(res => {
                res.should.equal(rand);
                done();
            }).catch(err => {
                done(err);
            });
        });

    });

    describe('parse', () => {

        it('should parse in place of then', done => {
            return new Linker(Promise.resolve(data.unparsed)).parse(res => {
                res.should.deep.equal(data.parsed);
                done();
            }, err => {
                done(err);
            }).catch(err => {
                done(err);
            });
        });

        it('should parse as a chain before then', done => {
            return new Linker(Promise.resolve(data.unparsed)).parse().then(res => {
                res.should.deep.equal(data.parsed);
                done();
            }, err => {
                done(err);
            }).catch(err => {
                done(err);
            });
        });

        it('should be able to parse a circularly referenced object', done => {
            return reader.getEntryById(entryId).parse(entry => {
                let nested = entry.fields.ref.fields.ref.fields.ref.fields.ref.fields.ref.fields.ref.fields.ref.fields.ref.fields.ref.fields.ref;
                nested.id.should.equal(entryId);
                nested.should.not.have.property('sys');
                done();
            }, err => {
                done(err);
            }).catch(err => {
                done(err);
            });
        });

        it('should fail to parse a bad object as a chain', done => {
            return new Linker(Promise.resolve(data.badparse)).parse().then(data => {
                done(new Error("Expected an error..."));
            }, err => {
                err.message.should.be.a('string');
                done();
            }).catch(err => {
                done(err);
            });
        });

        it('should fail to parse a bad object in place of then', done => {
            return new Linker(Promise.resolve(data.badparse)).parse(data => {
                done(new Error("Expected an error..."));
            }, err => {
                err.message.should.be.a('string');
                done();
            }).catch(err => {
                done(err);
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
