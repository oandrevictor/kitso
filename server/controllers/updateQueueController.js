var UpdateQueue = require('../models/UpdateQueue');
var RequestStatus = require('../constants/requestStatus');

exports.create = function(req, res) {
  var tvshowToUpdate = new UpdateQueue(req.body);

  tvshowToUpdate.save()
    .catch((err) => {
      res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((createdQueueItem) => {
      res.status(RequestStatus.OK).send(createdQueueItem);
    });
};