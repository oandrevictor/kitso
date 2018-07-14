var Notification = require('../models/Notification');
var RequestStatus = require('../constants/requestStatus');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');
var TMDBController = require('../external/TMDBController');

exports.index = function(req, res) {
  Notification.find({ _user: req.body.user_id })
  .catch((err) => {
    res.status(RequestStatus.BAD_REQUEST).send(err);
  })
  .then((notification) => {
    res.status(RequestStatus.OK).json(notification);
  });
};

exports.create = async function(req, res) {
  var notification = new Notification(req.body);

  notification.save()
  .catch((err) => {
    res.status(400).send(err);
  })
  .then((createdNotification) => {
    res.status(RequestStatus.OK).send(createdNotification);
  });
};

exports.setViewed = function(req, res) {
  Notification.findById(req.params.notification_id)
  .catch((err) => {
    res.status(RequestStatus.BAD_REQUEST).send(err);
  })
  .then((notification) => {
    if (req.body.viewed) notification.viewed = req.body.viewed;

    notification.save()
    .catch((err) => {
      res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((updatedNotification) => {
      res.status(RequestStatus.OK).json(updatedNotification);
    });
  });
};
