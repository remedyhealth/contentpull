let data = {
  unparsed: {
    sys: {
      id: 'test1',
      type: 'Entry',
      createdAt: '1',
      updatedAt: '2',
      revision: '3',
      contentType: {
        sys: {
          id: 'test'
        }
      }
    },
    fields: {
      str: 'test',
      obj: {
        sys: {
          id: 'test2',
          type: 'Entry',
          createdAt: '1',
          updatedAt: '2',
          revision: '3',
          contentType: {
            sys: {
              id: 'test'
            }
          }
        },
        fields: {
          test: 'test'
        }
      },
      arr: [{
        sys: {
          id: 'test3',
          type: 'Asset',
          createdAt: '1',
          updatedAt: '2',
          revision: '3'
        },
        fields: {
          file: {
            url: 'http://test.com/img.jpg'
          }
        }
      }, {
        sys: {
          type: 'Link'
        }
      }],
      link: {
        sys: {
          type: 'Link'
        }
      },
      space: {
        sys: {
          type: 'Space',
          id: 'spaceid',
          createdAt: '1',
          updatedAt: '2',
          revision: '3'
        }
      }
    }
  },
  badparse: {
    sys: {
      type: 'Array'
    },
    fields: 'nope'
  },
  parsed: {
    id: 'test1',
    type: 'Entry',
    meta: {
      createdAt: '1',
      updatedAt: '2',
      revision: '3'
    },
    contentType: 'test',
    fields: {
      str: 'test',
      obj: {
        id: 'test2',
        type: 'Entry',
        contentType: 'test',
        meta: {
          createdAt: '1',
          updatedAt: '2',
          revision: '3'
        },
        fields: {
          test: 'test'
        }
      },
      arr: [{
        id: 'test3',
        type: 'Asset',
        meta: {
          createdAt: '1',
          updatedAt: '2',
          revision: '3'
        },
        fields: {
          src: 'http://test.com/img.jpg'
        }
      }],
      space: {
        id: 'spaceid',
        type: 'Space'
      }
    }
  }
}

data.unparsedArr = {
  sys: {
    type: 'Array'
  },
  total: 1,
  items: [data.unparsed]
}

data.parsedArr = {
  meta: {
    total: 1
  },
  items: [data.parsed]
}

export default data
