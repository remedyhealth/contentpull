const createMeta = (entry) => {
  entry.meta = {
    createdAt: entry.sys.createdAt,
    updatedAt: entry.sys.updatedAt,
    revision: entry.sys.revision
  }

  delete entry.sys
}

export default {

  /**
   * Parses space objects.
   * + id
   * + type
   * - sys
   * @param {Object} space - The unparsed space object.
   * @param {function} parse - The parse tunnel instance.
   * @returns {Object} The now parsed object.
   */
  Space: (space, parse) => {
    // Add the important stuff
    space.id = space.sys.id
    space.type = space.sys.type

    // clean up before iterating over children
    delete space.sys

    return space
  },

  /**
   * Parses entry objects.
   * + id
   * + type
   * + contentType
   * + meta
   * + meta.createdAt
   * + meta.updatedAt
   * + meta.revision
   * - sys
   * @param {Object} entry - The unparsed entry object.
   * @param {function} parse - The parse tunnel instance.
   * @returns {Object} The now parsed object.
   */
  Entry: (entry, parse) => {
    // Add the important stuff
    entry.id = entry.sys.id
    entry.type = entry.sys.type

    entry.contentType = entry.sys.contentType.sys.id

    createMeta(entry)

    for (let key in entry.fields) {
      if (entry.fields[key] && entry.fields[key].sys) {
        const val = parse(entry.fields[key])
        if (val) {
          entry.fields[key] = parse(entry.fields[key])
        } else {
          delete entry.fields[key]
        }
      } else if (Array.isArray(entry.fields[key])) {
        for (let i = entry.fields[key].length - 1; i >= 0; i--) {
          const val = parse(entry.fields[key][i])
          if (val) {
            entry.fields[key][i] = val
          } else {
            entry.fields[key].splice(i, 1)
          }
        }
      }
    }

    return entry
  },

  /**
   * Parses asset objects.
   * + id
   * + type
   * + meta
   * + meta.createdAt
   * + meta.updatedAt
   * + meta.revision
   * - sys
   * @param {Object} asset - The unparsed asset object.
   * @param {function} parse - The parse tunnel instance.
   * @returns {Object} The now parsed object.
   */
  Asset: (asset, parse) => {
    // Add the important stuff
    asset.id = asset.sys.id
    asset.type = asset.sys.type

    createMeta(asset)

    asset.fields.contentType = asset.fields.file.contentType
    asset.fields.src = asset.fields.file.url
    delete asset.fields.file

    return asset
  },

  /**
   * Parses array objects.
   * + meta
   * + meta.total
   * - sys
   * - skip
   * - limit
   * - includes
   * - total
   * @param {Object} entry - The unparsed entry object.
   * @param {function} parse - The parse tunnel instance.
   * @returns {Object} The now parsed object.
   */
  Array: (array, parse) => {
    array.meta = {
      total: array.total
    }
    delete array.sys
    delete array.skip
    delete array.limit
    delete array.includes
    delete array.total
    array.items = array.items.map(item => parse(item))

    return array
  },

  Link: (link, parse) => {}
}
