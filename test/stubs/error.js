module.exports = {
  sys: {
    type: 'Error',
    id: 'InvalidQuery'
  },
  message: 'Bad query example.',
  details: {
    errors: [{
      name: 'unknownContentType',
      value: 'DOESNOTEXIST'
    }]
  },
  requestId: 'badrequest1'
}
