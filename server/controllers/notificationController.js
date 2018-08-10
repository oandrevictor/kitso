var Notification = require('../models/Notification');
var Action = require('../models/Action');
var RequestStatus = require('../constants/requestStatus');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');
var TMDBController = require('../external/TMDBController');

exports.index = function(req, res) {
  Notification.find({ _user: req.params.user_id })
  .catch((err) => {
    res.status(RequestStatus.BAD_REQUEST).send(err);
  })
  .then(async (notificationsObj) => {
    let notifications = notificationsObj.map(async (notification) => {
      return notificationRelated(notification);
    });

    await Promise.all(notifications).then((result) => {
      notificationsObj = result;
      res.status(RequestStatus.OK).json(notificationsObj);
    });
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

exports.delete = async function(req, res) {
  Notification.remove({ _id: req.params.notification_id })
  .catch((err) => {
    res.status(RequestStatus.BAD_REQUEST).send(err);
  })
  .then((deletedNotification) => {
    res.status(RequestStatus.OK).json(deletedNotification);
  });
};

var notificationRelated = async function(notification) {
  let action = await Action.findById(notification._related);
  let notification_copy = {date: '', viewed: '', content: '', _related: '', _user: ''};   
  notification_copy.date = notification.date;
  notification_copy.viewed = notification.viewed;
  notification_copy.content = notification.content;
  if (action) {
    notification_copy._related = await DataStoreUtils.getActionByTypeAndIdWithDetails(action.action_type, action._action);
  } else {
    notification_copy._related = notification.related;
  }
  notification_copy._user = notification._user;
  return notification_copy;
}
