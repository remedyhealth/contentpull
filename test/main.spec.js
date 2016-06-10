'use strict'

// Tests suite
const chai = require('chai');
chai.should();

// The stars of the show!
const Wrapper = require('../src/wrapper');
const Linker = require('../src/linker');
const Parser = require('../src/parser');
const ReaderError = require('../src/error');

// Third-parties
const cloneDeep = require('lodash.clonedeep');
const url = require('url');
const Mitm = require('mitm');
const mitm = Mitm();

// Mock Data
const mockData = require('./stubs');
const spaceId = mockData.space.sys.id;
const entryType = mockData.entry.sys.contentType.sys.id;
const assetType = mockData.asset.fields.file.contentType;
const entryId = mockData.entry.sys.id;
const assetId = mockData.asset.sys.id;
const entryTitle = mockData.entry.fields.title;

// Local helpers
const data = require('./mocha.data');
const rejectedType = 'qaEntryNOPE';
const rejectedAsset = 'imageNOPE';
const emptyArray = 'emptyArray';
const rand = Date.now();
const defaultErr = new Error("Expected an error...");
let baseUrl = '/spaces/' + spaceId + '/';
let expectedParts = [];
let reader;

// create reader and mock server to use for tests
before(() => {

    mitm.on('request', (req, res) => {

        if (req.url.indexOf(baseUrl) !== 0) {
            throw new Error(`Url request did not match expected (bad base url).\n\nExpected: ${baseUrl}\nUrl: ${req.url}`);
        }
        expectedParts.map(val => {
            if (req.url.indexOf(val) === -1) {
                throw new Error(`Url request did not match expected (missing part).\n\nMissing Part: ${val}\nUrl: ${req.url}`);
            }
        });
        const $url = url.parse(req.url);
        let pathParts = $url.pathname.split('/');
        pathParts.shift();
        const part = pathParts[2];

        function end(data) {
            return res.end(JSON.stringify(data));
        }

        if (req.url.indexOf(rejectedType) > -1 || req.url.indexOf(rejectedAsset) > -1) {
            res.statusCode = 400;
            return end(mockData.error);
        } else if (req.url.indexOf(emptyArray) > -1) {
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
        spaceId,
        'prodkey');

    // Throwaway
    new Wrapper(
        spaceId,
        'prevkey',
        true);
});

// clean up the mock server
after(() => {
    //xhr.restore();
});

describe('Wrapper', () => {

    describe('getSpace', () => {

        it('should return data about the registered space', () => {
            expectedParts = [];
            return reader.getSpace().then(res => {
                res.sys.id.should.equal(mockData.space.sys.id);
            });
        });

    });

    describe('getEntries', () => {

        it('should return all entries when no criteria is passed', () => {
            expectedParts = ['/entries?', 'include=10'];
            return reader.getEntries().then(res => {
                res.should.have.property('total');
                res.total.should.be.above(0);
            });
        });

        it('should return entries that match criteria specified', () => {
            expectedParts = ['/entries?', 'include=10', `content_type=${entryType}`];
            return reader.getEntries({
                content_type: entryType
            }).then(res => {
                res.should.have.property('items');
                res.total.should.equal(1);
                res.items[0].sys.contentType.sys.should.have.property('id', entryType);
            });
        });

        it('should return nothing if no entries match', done => {
            expectedParts = ['/entries?', 'include=10', `content_type=${rejectedType}`];
            return reader.getEntries({
                content_type: rejectedType
            }).then(res => {
                done(defaultErr);
            }, err => {
                err.message.should.be.a('string');
                done();
            }).catch(err => {
                done(err);
            });
        });

    });

    describe('getAssets', () => {

        it('should return all assets when no criteria is passed', () => {
            expectedParts = ['/assets?', 'include=10'];
            return reader.getAssets().then(res => {
                res.should.have.property('total');
                res.total.should.be.above(0);
            });
        });

        it('should return assets that match criteria specified', () => {
            expectedParts = ['/assets?', 'include=10', `fields.file.contentType=${assetType}`];
            return reader.getAssets({
                'fields.file.contentType': assetType
            }).then(res => {
                res.should.have.property('items');
                res.total.should.be.above(0);
                res.items[0].fields.file.contentType.should.equal(assetType);
            });
        });

        it('should return nothing if no assets match', done => {
            expectedParts = ['/assets?', 'include=10', `fields.file.contentType=${rejectedAsset}`];
            return reader.getAssets({
                'fields.file.contentType': rejectedAsset
            }).then(res => {
                done(defaultErr);
            }, err => {
                err.message.should.be.a('string');
                done();
            }).catch(err => {
                done(err);
            });
        });
    });

    describe('getEntry', () => {

        it('should return first entry when no criteria is passed', () => {
            expectedParts = ['/entries?', 'include=10', 'limit=1'];
            return reader.getEntry().then(res => {
                res.sys.should.have.property('type', 'Entry');
            });
        });

        it('should return first entry that matches criteria specified', () => {
            expectedParts = ['/entries?', 'include=10', 'content_type', 'limit=1', `content_type=${entryType}`];
            return reader.getEntry({
                content_type: entryType
            }).then(res => {
                res.sys.should.have.property('type', 'Entry');
            });
        });

        it('should return nothing if no entries match', done => {
            expectedParts = ['/entries?', 'include=10', 'limit=1', `content_type=${rejectedType}`];
            return reader.getEntry({
                content_type: rejectedType
            }).then(res => {
                done(defaultErr);
            }, err => {
                err.message.should.be.a('string');
                done();
            }).catch(err => {
                done(err);
            });
        });
    });

    describe('getAsset', () => {

        it('should return first asset when no criteria is passed', () => {
            expectedParts = ['/assets?', 'include=10', 'limit=1'];
            return reader.getAsset().then(res => {
                res.sys.should.have.property('type', 'Asset');
            });
        });

        it('should return first asset that matches criteria specified', () => {
            expectedParts = [
                '/assets?',
                'include=10',
                'limit=1',
                `fields.file.contentType=${assetType}`,
            ];
            return reader.getAsset({
                'fields.file.contentType': assetType
            }).then(res => {
                res.sys.should.have.property('type', 'Asset');
            });
        });

        it('should return nothing if no assets match', done => {
            expectedParts = [
                '/assets?',
                'include=10',
                'limit=1',
                `fields.file.contentType=${rejectedAsset}`,
            ];
            return reader.getAsset({
                'fields.file.contentType': rejectedAsset
            }).then(res => {
                done(defaultErr);
            }, err => {
                err.message.should.be.a('string');
                done();
            }).catch(err => {
                done(err);
            });
        });

    });

    describe('getEntryById', () => {

        it('should return a single entry when requesting by id', () => {
            expectedParts = [
                '/entries?',
                'limit=1',
                `sys.id=${entryId}`,
            ];
            return reader.getEntryById(entryId).then(entry => {
                entry.sys.should.have.property('id');
                entry.sys.id.should.equal(entryId);
            });
        });

    });

    describe('getAssetById', () => {

        it('should return a single asset when requesting by id', () => {
            expectedParts = [
                '/assets?',
                'include=10',
                'limit=1',
                `sys.id=${assetId}`,
            ];
            return reader.getAssetById(assetId).then(entry => {
                entry.sys.should.have.property('id');
                entry.sys.id.should.equal(assetId);
            });
        });
    });

    describe('getEntriesByType', () => {
        it('should return entries by content type', () => {
            expectedParts = [
                '/entries?',
                'include=10',
                `content_type=${entryType}`,
            ];
            return reader.getEntriesByType(entryType).then(entries => {
                entries.should.have.property('items');
                entries.total.should.be.above(0);
            });
        });
    });

    describe('findEntryByType', () => {

        it('should return all entries when no criteria is passed', () => {
            expectedParts = [
                '/entries?',
                'include=10',
                'limit=1',
                `content_type=${entryType}`,
            ];
            return reader.findEntryByType(entryType).then(res => {
                res.sys.should.have.property('type', 'Entry');
            });
        });

        it('should return entries that match criteria specified', () => {
            expectedParts = [
                '/entries?',
                'include=10',
                'limit=1',
                `content_type=${entryType}`,
                `fields.title=${entryTitle}`,
            ];
            return reader.findEntryByType(entryType, {
                title: entryTitle
            }).then(res => {
                res.sys.should.have.property('type', 'Entry');
                res.fields.title.should.equal(entryTitle);
            });
        });

        it('should return nothing if no entries match', done => {
            expectedParts = [
                '/entries?',
                'include=10',
                'limit=1',
                `content_type=${entryType}`,
                `fields.title=${emptyArray}`,
            ];
            return reader.findEntryByType(entryType, {
                title: emptyArray
            }).then(res => {
                done(defaultErr);

            }, err => {
                err.message.should.be.a('string');
                done();
            }).catch(err => {
                done(err);
            });
        });
    });

    describe('findEntriesByType', () => {

        it('should return all entries that match the criteria', () => {
            expectedParts = [
                '/entries?',
                'include=10',
                `content_type=${entryType}`,
                `fields.title=${entryTitle}`,
            ];
            return reader.findEntriesByType(entryType, {
                title: entryTitle
            }).then(res => {
                res.should.have.property('items');
                res.total.should.be.above(0);
            });
        });

        it('should return nothing if no entries match', () => {
            expectedParts = ['/entries?', 'include=10', `content_type=${entryType}`, `fields.title=${emptyArray}`];
            return reader.findEntriesByType(entryType, {
                title: emptyArray
            }).then(res => {
                res.total.should.equal(0);
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
            const obj = {
                test: {
                    is: true
                }
            };
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

        it('should still run then functions', () => {
            return new Linker(Promise.resolve(rand)).then(res => {
                res.should.equal(rand);
            });
        });

    });

    describe('catch', () => {

        it('should still run catch statements with then statements', done => {
            return new Linker(Promise.reject(rand)).then(res => {
                done(defaultErr);
            }, err => {
                err.should.equal(rand);
                done();
            }).catch(err => {
                done(err);
            });
        });

        it('should still run catch statements standalone', () => {
            return new Linker(Promise.reject(rand)).catch(res => {
                res.should.equal(rand);
            });
        });

    });

    describe('parse', () => {

        it('should parse in place of then', () => {
            return new Linker(Promise.resolve(data.unparsed)).parse(res => {
                res.should.deep.equal(data.parsed);
            });
        });

        it('should parse as a chain before then', () => {
            return new Linker(Promise.resolve(data.unparsed)).parse().then(res => {
                res.should.deep.equal(data.parsed);
            });
        });

        it('should be able to parse a circularly referenced object', () => {
            expectedParts = ['/entries?', 'include=10', 'limit=1', `sys.id=${entryId}`];
            return reader.getEntryById(entryId).parse(entry => {
                let nested = entry.fields.ref.fields.ref.fields.ref.fields.ref.fields.ref.fields.ref.fields.ref.fields.ref.fields.ref.fields.ref;
                nested.id.should.equal(entryId);
                nested.should.not.have.property('sys');
            });
        });

        it('should fail to parse a bad object as a chain', done => {
            return new Linker(Promise.resolve(data.badparse)).parse().then(data => {
                done(defaultErr);
            }, err => {
                err.message.should.be.a('string');
                done();
            }).catch(err => {
                done(err);
            });
        });

        it('should fail to parse a bad object in place of then', done => {
            return new Linker(Promise.resolve(data.badparse)).parse(data => {
                done(defaultErr);
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
