var Liked = require('../models/Liked');
var Action = require('../models/Action');
var User = require('../models/User');
var RequestStatus = require('../constants/requestStatus');
var ActionType = require('../constants/actionType');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');

exports.index = async function(req, res) {
  let user_id = req.params.user_id;
  let liked_list, promises;
  try {
    liked_list = await DataStoreUtils.getLikedByUserId(user_id);
    promises = liked_list.map(injectActivityInLiked);
  } catch (err) {
    res.status(RequestStatus.BAD_REQUEST).json(err);
  }
  Promise.all(promises).then(function(results) {
    res.status(RequestStatus.OK).json(results);
  })
};

exports.is_liked = async function(req, res) {
  let user_id = req.query.user_id;
  let activity_id = req.query.activity_id;
  try {
    let user_did_liked = await DataStoreUtils.userHasLiked(user_id, activity_id);
    if (user_did_liked.length > 0) {
      res_json = {
        "is_liked": true,
        "_id": user_did_liked[0]._id
      }
      res.status(RequestStatus.OK).json(res_json);
    } else {
      json_not_liked = {"is_liked": false};
      res.status(RequestStatus.OK).json(json_not_liked);
    }
  } catch (err) {
    res.status(RequestStatus.BAD_REQUEST).json(err);
  }
};

exports.show = function(req, res) {
  Liked.findById(req.params.liked_id)
    .catch((err) => {
      res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((result) => {
      res.status(RequestStatus.OK).json(result);
    });
};

exports.create = async function(req, res) {
  var liked = new Liked(req.body);
  let user_id = liked._user;
  let action = await DataStoreUtils.createAction(user_id, liked._id, ActionType.LIKED);
  let activity = await Action.findById(req.body._activity).exec();
  let user = await DataStoreUtils.getUserById(liked._user);

  DataStoreUtils.createNotification(activity._user, liked._activity, user.username + " liked your post.");
  liked._action = action._id;
  await DataStoreUtils.addActionToUserHistory(user_id, action._id);
  liked.save()
  .catch((err) => {
    res.status(RequestStatus.BAD_REQUEST).send(err);
  })
  .then((createdLiked) => {
    res.status(RequestStatus.OK).json(createdLiked);
  });
}

exports.update = async function(req, res) {
  let liked_id = req.params.liked_id;
  try {
    var liked = await findLikedObj(liked_id);
  } catch (err) {
    // if there is no liked with informed id
    res.status(RequestStatus.BAD_REQUEST).send(err);
  }

  if (req.body.date) {
    liked.date = req.body.date;
  }

  if (req.body._activity) {
    liked._activity = req.body._activity;
  }

  if (req.body.reaction) {
    liked.reaction = req.body.reaction;
  }

  liked.save()
  .catch((err) => {
    res.status(RequestStatus.BAD_REQUEST).send(err);
  })
  .then((updatedLiked) => {
    res.status(RequestStatus.OK).json(updatedLiked);
  });
};

exports.delete = async function(req, res) {
  let liked_id = req.params.liked_id;
  try {
    await DataStoreUtils.deleteLiked(liked_id);
    DataStoreUtils.deleteNotification(liked_id);
    res.status(RequestStatus.OK).send('Liked deleted.');
  } catch (err) {
    res.status(RequestStatus.BAD_REQUEST).send(err);
  }
};

var injectActivityInLiked = async function(liked_obj) {
  var activity_id = liked_obj._activity;
  var activity_obj = await DataStoreUtils.getAction(activity_id);
  var activity_obj_nested = await DataStoreUtils.getActionByTypeAndIdWithDetails(activity_obj.action_type, activity_id);
  return activity_obj_nested;
};
