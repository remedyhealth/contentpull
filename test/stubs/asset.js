export default {
  sys: {
    space: {
      sys: {
        type: 'Link',
        linkType: 'Space',
        id: 'space1'
      }
    },
    id: 'asset1',
    type: 'Asset',
    createdAt: '2015-12-29T15:06:40.402Z',
    updatedAt: '2016-04-04T18:00:31.337Z',
    revision: 2,
    locale: 'en-US'
  },
  fields: {
    title: 'Image',
    description: 'Image description',
    file: {
      url: '//images.contentful.com/space1/rand1/asset1/image.png',
      details: {
        size: 3905,
        image: {
          width: 256,
          height: 256
        }
      },
      fileName: 'image.png',
      contentType: 'png' // image/png
    }
  }
}
