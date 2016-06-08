module.exports = {
  "sys": {
    "type": "Error",
    "id": "InvalidQuery"
  },
  "message": "The query you sent was invalid. Probably a filter or ordering specification is not applicable to the type of a field.",
  "details": {
    "errors": [
      {
        "name": "unknownContentType",
        "value": "DOESNOTEXIST"
      }
    ]
  },
  "requestId": "badrequest1"
};
