var FollowsPage = require('../models/FollowsPage');
var Media = require('../models/Media');
var Person = require('../models/Person');
var RequestStatus = require('../constants/requestStatus');
var ActionType = require('../constants/actionType');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');
var bcrypt = require('bcryptjs');

exports.index = async function(req, res) {
  let user_id = req.params.user_id;
  let following_list;
  try {
    following_list = await FollowsPage.find({_user: user_id}).exec();
    promises = following_list.map(getFollowedFromFollow);

    Promise.all(promises).then(function(results) {
      res.status(RequestStatus.OK).json(results);
    })
  } catch (err) {
    res.status(RequestStatus.BAD_REQUEST).json(err);
  }
};

exports.is_following = async function(req, res) {
  let user_id = req.query.user_id;
  let following_id = req.query.following_id;

  FollowsPage.find({_user: user_id, _following: following_id}, function(err, result) {
    if (err) {
      res.status(RequestStatus.BAD_REQUEST).json(err);
    } else {
      if (result.length > 0) {
        res_json = {
          "is_following": true,
          "following_id": result[0]._id
        }
        res.status(RequestStatus.OK).json(res_json);
      } else {
        json_not_following = {"is_following": false};
        res.status(RequestStatus.OK).json(json_not_following);
      }
    }
  });
};

exports.following_me = async function(req, res) {
  let page_id = req.query.page_id;
  let following_me_list;
  try {
    following_me_list = await FollowsPage.find({_following: page_id}).exec();
    var result = [];
    following_me_list.forEach(function (f) {
      var data = {
          "_user": f._user.toString(),
          "_following": f._following,
          "is_private": f.is_private,
          "is_media" : f.is_media,
          "_action": f._action,
          "__v": f.__v,
          "_id": f._id
      };
      if (f.is_private) {
        var hash = bcrypt.hashSync(f._user.toString(), 10);
        data._user = hash;
      }
      result.push(data);
    });
    res.status(RequestStatus.OK).json(result);
  } catch (err) {
    res.status(RequestStatus.BAD_REQUEST).json(err);
  }
};

exports.create = async function(req, res) {
  var follow = new FollowsPage(req.body);
  let user_id = follow._user;
  let action = await DataStoreUtils.createAction(user_id, follow._id, ActionType.FOLLOWED_PAGE);
  follow._action = action._id;
  await DataStoreUtils.addActionToUserHistory(user_id, action._id);
  // TODO: add to user._followingpages field
  follow.save().catch((err) => {
    res.status(RequestStatus.BAD_REQUEST).send(err);
  })
  .then((createdFollow) => {
    res.status(RequestStatus.OK).send(createdFollow);
  });
};

exports.delete = async function(req, res) {
  let followId = req.params.followsPage_id;
  try {
    let deletedFollowedPage = await DataStoreUtils.deleteFollowsPage(followId);
    res.status(RequestStatus.OK).json(deletedFollowedPage);
  } catch (err) {
    res.status(RequestStatus.BAD_REQUEST).send(err);
  }
};

var getFollowedFromFollow = async function(follow) {
  if (follow.is_media) {
    return Media.findById(follow._following).exec();
  } else {
    return Person.findById(follow._following).exec();
  }
};
