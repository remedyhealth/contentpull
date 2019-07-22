/* global describe, it, before */
/* eslint no-unused-expressions: 0 */

// Tests suite
const chai = require('chai')
const chaiSubset = require('chai-subset')

// The stars of the show!
const Wrapper = require('../src/wrapper')
const EntryPoint = require('../')

// Third-parties
const cloneDeep = require('lodash.clonedeep')
const Mitm = require('mitm')

// required samples
const mockData = require('./stubs')
const data = require('./data')

// setting things up
chai.should()
chai.use(chaiSubset)
const mitm = Mitm()

// Mock Data
const spaceId = mockData.space.sys.id
const entryType = mockData.entry.sys.contentType.sys.id
const assetType = mockData.asset.fields.file.contentType
const entryId = mockData.entry.sys.id
const assetId = mockData.asset.sys.id
const entryTitle = mockData.entry.fields.title

// Local helpers
const rejectedType = 'qaEntryNOPE'
const rejectedAsset = 'imageNOPE'
const emptyArray = 'emptyArray'
const rand = Date.now()
const defaultErr = new Error('Expected an error...')
const baseUrl = '/spaces/' + spaceId + '/'
let expectedParts = []

// create puller and mock server to use for tests
before(() => {
  mitm.on('request', (req, res) => {
    if (req.url.indexOf(baseUrl) !== 0) {
      throw new Error(`Url request did not match expected (bad base url).\n\nExpected: ${baseUrl}\nUrl: ${req.url}`)
    }
    expectedParts.map(val => {
      if (req.url.indexOf(val) === -1) {
        throw new Error(`Url request did not match expected (missing part).\n\nMissing Part: ${val}\nUrl: ${req.url}`)
      }
    })
    const pathParts = req.url.split('?')[0].split('/')
    pathParts.shift()
    const part = pathParts[4]

    const end = data => {
      return res.end(JSON.stringify(data))
    }

    if (req.url.indexOf(rejectedType) > -1 || req.url.indexOf(rejectedAsset) > -1) {
      res.statusCode = 400
      return end(mockData.error)
    } else if (req.url.indexOf(emptyArray) > -1) {
      return end(mockData.emptyArray)
    } else if (part === 'entries') {
      const ret = JSON.parse(JSON.stringify(mockData.entries))
      if (req.url.indexOf('limit=1000') !== -1 && req.url.indexOf('skip') === -1) {
        for (let i = 1; i < mockData.entries.total - 1; i++) {
          ret.items.push(ret.items[0])
        }
      }
      return end(ret)
    } else if (part === 'assets') {
      return end(mockData.assets)
    } else {
      return end(mockData.space)
    }
  })
})

describe('EntryPoint', () => {
  it('should load either the source or the dist', () => {
    EntryPoint.should.be.oneOf([Wrapper])
  })
})

const setupPullerTests = (C, name) => {
  let puller
  before(() => {
    puller = new C(spaceId, 'prodkey')
  })

  describe(name, () => {
    describe('Puller', () => {
      describe('isPreview', () => {
        it('should return true when in preview mode', () => {
          const previewPuller = new C(
            spaceId,
            'prevkey', {
              preview: true
            }
          )

          previewPuller.isPreview.should.be.true
        })

        it('should return false when in production mode', () => {
          puller.isPreview.should.be.false
        })
      })
    })

    describe('environments', () => {
      it('should default to "master"', () => {
        const p = new C(
          spaceId,
          'prevkey'
        )

        p.config.environment.should.equal('master')
      })

      it('should support setting envs', () => {
        const p = new C(
          spaceId,
          'prevkey', {
            environment: 'haha'
          }
        )

        p.config.environment.should.equal('haha')
      })
    })

    describe('Wrapper', () => {
      describe('_link:then', () => {
        it('should still run then functions', () => {
          return puller._link(Promise.resolve(rand)).then(res => {
            res.should.equal(rand)
          })
        })
      })

      describe('_link:catch', () => {
        it('should still run catch statements with then statements', done => {
          puller._link(Promise.reject(rand)).then(res => {
            done(defaultErr)
          }, err => {
            err.should.equal(rand)
            done()
          }).catch(err => {
            done(err)
          })
        })

        it('should still run catch statements standalone', () => {
          return puller._link(Promise.reject(rand)).catch(res => {
            res.should.equal(rand)
          })
        })
      })

      describe('Wrapper:_createParseTunnel', () => {
        it('should not parse falsy', () => {
          const _puller = cloneDeep(puller)
          _puller._parsers['Entry'] = false
          const parsed = _puller._createParseTunnel(_puller)(cloneDeep(data.unparsed))
          parsed.should.deep.equal(data.unparsed)
        })

        it('should parse a single object', () => {
          const parsed = puller._createParseTunnel(puller)(cloneDeep(data.unparsed))
          parsed.should.deep.equal(data.parsed)
        })

        it('should parse an array', () => {
          const parsed = puller._createParseTunnel(puller)(cloneDeep(data.unparsedArr))
          parsed.should.deep.equal(data.parsedArr)
        })

        it('should not interfere with regular objects', () => {
          const obj = {
            test: {
              is: true
            }
          }
          const parsed = puller._createParseTunnel(puller)(obj)
          parsed.should.deep.equal(obj)
        })

        it('should parse a single object', () => {
          const parsed = puller._createParseTunnel(puller)(data.unparsed)
          parsed.should.deep.equal(data.parsed)
        })

        it('should parse an array', () => {
          const parsed = puller._createParseTunnel(puller)(data.unparsed)
          parsed.should.deep.equal(data.parsed)
        })
      })

      describe('_link:parse', () => {
        it('should parse in place of then', () => {
          return puller._link(Promise.resolve(data.unparsed)).parse(res => {
            res.should.deep.equal(data.parsed)
          })
        })

        it('should parse as a chain before then', () => {
          return puller._link(Promise.resolve(data.unparsed)).parse().then(res => {
            res.should.deep.equal(data.parsed)
          })
        })

        it('should be able to parse a circularly referenced object', () => {
          expectedParts = ['/entries?', 'include=10', 'limit=1', `sys.id=${entryId}`]
          return puller.getEntryById(entryId).parse(entry => {
            const nested = entry.fields.ref.fields.ref.fields.ref.fields.ref.fields.ref.fields.ref.fields.ref.fields.ref.fields.ref.fields.ref
            nested.id.should.equal(entryId)
            nested.should.not.have.property('sys')
          })
        })

        it('should fail to parse a bad object as a chain', done => {
          puller._link(Promise.resolve(data.badparse)).parse().then(data => {
            done(defaultErr)
          }, err => {
            err.message.should.be.a('string')
            done()
          }).catch(err => {
            done(err)
          })
        })

        it('should fail to parse a bad object in place of then', done => {
          puller._link(Promise.resolve(data.badparse)).parse(data => {
            done(defaultErr)
          }, err => {
            err.message.should.be.a('string')
            done()
          }).catch(err => {
            done(err)
          })
        })
      })

      describe('getSpace', () => {
        it('should return data about the registered space', () => {
          expectedParts = []
          return puller.getSpace().then(res => {
            res.sys.id.should.equal(mockData.space.sys.id)
          })
        })
      })

      describe('getEntries', () => {
        it('should return all entries when no criteria is passed', () => {
          expectedParts = ['/entries?', 'include=10']
          return puller.getEntries().then(res => {
            res.should.have.property('total')
            res.total.should.be.above(0)
          })
        })

        it('should return entries that match criteria specified', () => {
          expectedParts = ['/entries?', 'include=10', `content_type=${entryType}`]
          return puller.getEntries({
            content_type: entryType
          }).then(res => {
            res.items[0].sys.contentType.sys.should.have.property('id', entryType)
          })
        })

        it('should return nothing if no entries match', done => {
          expectedParts = ['/entries?', 'include=10', `content_type=${rejectedType}`]

          puller.getEntries({
            content_type: rejectedType
          }).then(res => {
            done(defaultErr)
          }, err => {
            err.message.should.be.a('string')
            done()
          }).catch(err => {
            done(err)
          })
        })
      })

      describe('getAssets', () => {
        it('should return all assets when no criteria is passed', () => {
          expectedParts = ['/assets?', 'include=10']
          return puller.getAssets().then(res => {
            res.should.have.property('total')
            res.total.should.be.above(0)
          })
        })

        it('should return assets that match criteria specified', () => {
          expectedParts = ['/assets?', 'include=10', `fields.file.contentType=${assetType}`]
          return puller.getAssets({
            'fields.file.contentType': assetType
          }).then(res => {
            res.should.have.property('items')
            res.total.should.be.above(0)
            res.items[0].fields.file.contentType.should.equal(assetType)
          })
        })

        it('should return nothing if no assets match', done => {
          expectedParts = ['/assets?', 'include=10', `fields.file.contentType=${rejectedAsset}`]
          puller.getAssets({
            'fields.file.contentType': rejectedAsset
          }).then(res => {
            done(defaultErr)
          }, err => {
            err.message.should.be.a('string')
            done()
          }).catch(err => {
            done(err)
          })
        })
      })

      describe('getEntry', () => {
        it('should return first entry when no criteria is passed', () => {
          expectedParts = ['/entries?', 'include=10', 'limit=1']
          return puller.getEntry().then(res => {
            res.sys.should.have.property('type', 'Entry')
          })
        })

        it('should return first entry that matches criteria specified', () => {
          expectedParts = ['/entries?', 'include=10', 'content_type', 'limit=1', `content_type=${entryType}`]
          return puller.getEntry({
            content_type: entryType
          }).then(res => {
            res.sys.should.have.property('type', 'Entry')
          })
        })

        it('should return nothing if no entries match', done => {
          expectedParts = ['/entries?', 'include=10', 'limit=1', `content_type=${rejectedType}`]

          puller.getEntry({
            content_type: rejectedType
          }).then(res => {
            done(defaultErr)
          }, err => {
            err.message.should.be.a('string')
            done()
          }).catch(err => {
            done(err)
          })
        })
      })

      describe('getAsset', () => {
        it('should return first asset when no criteria is passed', () => {
          expectedParts = ['/assets?', 'include=10', 'limit=1']
          return puller.getAsset().then(res => {
            res.sys.should.have.property('type', 'Asset')
          })
        })

        it('should return first asset that matches criteria specified', () => {
          expectedParts = [
            '/assets?',
            'include=10',
            'limit=1',
            `fields.file.contentType=${assetType}`
          ]
          return puller.getAsset({
            'fields.file.contentType': assetType
          }).then(res => {
            res.sys.should.have.property('type', 'Asset')
          })
        })

        it('should return nothing if no assets match', done => {
          expectedParts = [
            '/assets?',
            'include=10',
            'limit=1',
            `fields.file.contentType=${rejectedAsset}`
          ]

          puller.getAsset({
            'fields.file.contentType': rejectedAsset
          }).then(res => {
            done(defaultErr)
          }, err => {
            err.message.should.be.a('string')
            done()
          }).catch(err => {
            done(err)
          })
        })
      })

      describe('getEntryById', () => {
        it('should return a single entry when requesting by id', () => {
          expectedParts = [
            '/entries?',
            'limit=1',
            `sys.id=${entryId}`
          ]
          return puller.getEntryById(entryId).then(entry => {
            entry.sys.should.have.property('id')
            entry.sys.id.should.equal(entryId)
          })
        })
      })

      describe('getAssetById', () => {
        it('should return a single asset when requesting by id', () => {
          expectedParts = [
            '/assets?',
            'include=10',
            'limit=1',
            `sys.id=${assetId}`
          ]
          return puller.getAssetById(assetId).then(entry => {
            entry.sys.should.have.property('id')
            entry.sys.id.should.equal(assetId)
          })
        })
      })

      describe('getEntryByType', () => {
        it('should return all entries when no criteria is passed', () => {
          expectedParts = [
            '/entries?',
            'include=10',
            'limit=1',
            `content_type=${entryType}`
          ]
          return puller.getEntryByType(entryType).then(res => {
            res.sys.should.have.property('type', 'Entry')
          })
        })

        it('should return entries that match criteria specified', () => {
          expectedParts = [
            '/entries?',
            'include=10',
            'limit=1',
            `content_type=${entryType}`,
            `fields.title=${entryTitle}`
          ]
          return puller.getEntryByType(entryType, {
            title: entryTitle
          }).then(res => {
            res.sys.should.have.property('type', 'Entry')
            res.fields.title.should.equal(entryTitle)
          })
        })

        it('should return nothing if no entries match', done => {
          expectedParts = [
            '/entries?',
            'include=10',
            'limit=1',
            `content_type=${entryType}`,
            `fields.title=${emptyArray}`
          ]

          puller.getEntryByType(entryType, {
            title: emptyArray
          }).then(res => {
            done(defaultErr)
          }, err => {
            err.message.should.be.a('string')
            done()
          }).catch(err => {
            done(err)
          })
        })
      })

      describe('getEntriesByType', () => {
        it('should return all entries that match the criteria', () => {
          expectedParts = [
            '/entries?',
            'include=10',
            `content_type=${entryType}`,
            `fields.title=${entryTitle}`
          ]
          return puller.getEntriesByType(entryType, {
            title: entryTitle
          }).then(res => {
            res.should.have.property('items')
            res.total.should.be.above(0)
          })
        })

        it('should return nothing if no entries match', () => {
          expectedParts = ['/entries?', 'include=10', `content_type=${entryType}`, `fields.title=${emptyArray}`]

          puller.getEntriesByType(entryType, {
            title: emptyArray
          }).then(res => {
            res.total.should.equal(0)
          })
        })
      })

      describe('_getAllObjects', () => {
        it('should be able to gather all content even if over 1000 entries exist', () => {
          expectedParts = ['entries?', 'include=10', 'limit=1000']
          return puller._getAllObjects().then(objects => {
            objects.items.length.should.equal(mockData.entries.total)
          })
        })

        it('should still be able to be parsed', () => {
          return puller._getAllObjects().parse().then(objects => {
            objects.items[0].meta.should.be.an('object')
          })
        })
      })

      describe('_combineArray', () => {
        it('should combine array objects', () => {
          var combined = puller._combineArrays([mockData.entries, mockData.assets])

          combined.total.should.equal(mockData.entries.items.length + mockData.assets.items.length)
          combined.items.should.containSubset([{
            sys: {
              type: 'Entry'
            }
          }])
          combined.items.should.containSubset([{
            sys: {
              type: 'Asset'
            }
          }])
        })
      })

      describe('use', () => {
        it('should allow extensions with raw functions', () => {
          const testPhrase = 'works!'
          C.use(function test () {
            return testPhrase
          })

          C.prototype.test.should.be.an('function')
          puller.test().should.equal(testPhrase)
        })

        it('should allow extensions with objects', () => {
          const testPhrase = 'still works!'
          C.use({
            name: 'test',
            fn: function () {
              return testPhrase
            }
          })

          C.prototype.test.should.be.an('function')
          puller.test().should.equal(testPhrase)
        })

        it('should allow extensions with function names and function arguments', () => {
          const testPhrase = 'working!'
          C.use('test', () => {
            return testPhrase
          })

          C.prototype.test.should.be.an('function')
          puller.test().should.equal(testPhrase)
        })

        it('should reject unnamed functions', done => {
          try {
            C.use(() => {})
            done(defaultErr)
          } catch (e) {
            e.should.be.a('error')
            done()
          }
        })

        it('should reject empty arguments', done => {
          try {
            C.use()
            done(defaultErr)
          } catch (e) {
            e.should.be.a('error')
            done()
          }
        })
      })
    })
  })
}

setupPullerTests(Wrapper, 'Source')
