var Follows = require('../models/Follows');
var FollowsPage = require('../models/FollowsPage');
var Related = require('../models/Related');
var News = require('../models/News');
var Action = require('../models/Action');
var User = require('../models/User');
var RequestStatus = require('../constants/requestStatus');
var ActionType = require('../constants/actionType');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');

exports.index = async function(req, res) {
  let user_id = req.params.user_id;
  let following_list;
  try {
    following_list = await Follows.find({_user: user_id}).exec();
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

  Follows.find({_user: user_id, _following: following_id}, function(err, result) {
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
  let user_id = req.query.user_id;
  let following_me_list;
  try {
    following_me_list = await Follows.find({_following: user_id}).exec();
    promises = following_me_list.map(getFollowFromFollowed);

    Promise.all(promises).then(function(results) {
      res.status(RequestStatus.OK).json(results);
    })
  } catch (err) {
    res.status(RequestStatus.BAD_REQUEST).json(err);
  }
};
var getId = function(following){
  return following._following;
}
var getRelatedId = function(related){
  return related._id;
}
var getAction = function(news){
  return news._action;
}
exports.followed_activity = async function(req, res) {
  let user_id = req.params.user_id;
  let following_list;
  let page;
  if (req.query.page)
    page = parseInt(req.query.page);
  else
    page = 0;
  try {
    following_list = await Follows.find({_user: user_id}).exec();
    following_list2 = await FollowsPage.find({_user: user_id}).exec();
    following_list = following_list.concat(following_list2);
    following_list = following_list.map(getId);
    following_list.push(user_id);

    all_activitys = []
    actions = await Action.find({ "_user": { "$in": following_list } }).sort({date: -1}).skip(page * 10).limit(10);

    media_related = await Related.find({ "_media": { "$in": following_list } }).sort({date: -1});
    person_related = await Related.find({ "_person": { "$in": following_list } }).sort({date: -1});
    relateds = media_related.concat(person_related);
    relateds_ids = relateds.map(getRelatedId);

    news = await News.find({ "_related": { "$in": relateds_ids } }).sort({date: -1}).skip(page).limit(10);
    news_actions_ids = news.map(getAction);
    news_actions = await Action.find({ "_id": { "$in": news_actions_ids } }).sort({date: -1}).skip(page).limit(10);

    actions = actions.concat(news_actions);
    promises = actions.map(DataStoreUtils.getActivity);
    Promise.all(promises).then(function(results) {
      all_activitys = all_activitys.concat(results);
      res.status(RequestStatus.OK).send(all_activitys);
    })
  } catch (err) {
    console.log(err)
    res.status(RequestStatus.BAD_REQUEST).json(err);
  }
};


exports.create = async function(req, res) {
  var follow = new Follows(req.body);
  let user_id = follow._user;
  let action = await DataStoreUtils.createAction(user_id, follow._id, ActionType.FOLLOWED_USER);
  follow._action = action._id;
  await DataStoreUtils.addActionToUserHistory(user_id, action._id);

  follow.save()
  .catch((err) => {
    res.status(RequestStatus.BAD_REQUEST).send(err);
  })
  .then((createdFollow) => {
    res.status(RequestStatus.OK).send(createdFollow);
  });
};

exports.delete = async function(req, res) {
  let follow_id = req.params.follow_id;

  Follows.findById(follow_id, function(err, followed) {
    if (!followed || err) {
      res.status(RequestStatus.BAD_REQUEST).send("Follow inexistente");
    } else {
      let user_id = followed._user;
      let action_id = followed._action;
      delete_action(action_id);
      delete_action_from_user_history(user_id, action_id);

      Follows.remove({ _id: follow_id})
      .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
      })
      .then(() => {
        res.status(RequestStatus.OK).send('Follow removido.');
      });
    }
  });
};

exports.getFriendsWithWatchedMedia = async function (req, res) {
  let userId = req.query.userId;
  let mediaId = req.query.mediaId;
  let following_list = await Follows.find({_user: userId}).exec();

  var watchedPromises = [];
  var ratedPromises = [];

  following_list.forEach((following) => {
    let friendId = following._following;
    watchedPromises.push(DataStoreUtils.getWatchedByUserIdAndMediaId(friendId, mediaId));
    ratedPromises.push(DataStoreUtils.getRatedByUserIdAndMediaId(friendId, mediaId));
  });

  var watcheds;
  await Promise.all(watchedPromises).then((result) => {
    watcheds = result;
  });

  var rateds;
  await Promise.all(ratedPromises).then((result) => {
    rateds = result;
  });

  let userPromises = [];
  watcheds.forEach((watched) => {
    watched = watched[0];
    if (watched) {
      userPromises.push(DataStoreUtils.getUserById(watched._user));
    }
  });

  var friends;
  await Promise.all(userPromises).then((result) => {
    friends = result;
  });

  friends.forEach((friend) => {
    rateds.forEach((rated) => {
      rated = rated[0];
      if (rated) {
        if (friend._id.toString() === rated._user.toString()) {
          friend._ratings[0] = rated.rating;
        }
      }
    });
  });

  res.status(RequestStatus.OK).json(friends);
}

exports.getFriendsWithWatchedTvshow = async function (req, res) {
  let userId = req.query.userId;
  let seasonEpisodesIds = req.body.seasonEpisodesIds;
  let following_list = await Follows.find({_user: userId}).exec();
  let friendsIds = following_list.map(function(friend) {
    return friend._following;
  });

  var watchedPromises = [];
  var ratedPromises = [];
  seasonEpisodesIds.forEach((season) => {
    watchedPromises.push(DataStoreUtils.getWatchedByUserIdAndMediaId(friendsIds, season));
    ratedPromises.push(DataStoreUtils.getRatedByUserIdAndMediaId(friendsIds, season));
  });

  var seasonWatcheds;
  await Promise.all(watchedPromises).then((result) => {
    seasonWatcheds = result;
  });

  var rateds;
  await Promise.all(ratedPromises).then((result) => {
    rateds = result;
  });

  let userPromises = [];
  seasonWatcheds.forEach((watcheds) => {
    watcheds.forEach((watched) => {
      userPromises.push(DataStoreUtils.getUserById(watched._user));
    });
  });
  var unfilteredFriends;
  await Promise.all(userPromises).then((result) => {
    unfilteredFriends = result;
  });

  var friends_ids = [];
  var friends = [];
  unfilteredFriends.forEach((friend) => {
    if (!friends_ids.includes(friend._id.toString())) {
      friends.push(friend);
      friends_ids.push(friend._id.toString());
    }
  });

  friends.forEach((friend) => {
    rateds.forEach((rated) => {
      rated = rated[0];
      if (rated) {
        if (friend._id.toString() === rated._user.toString()) {
          friend._ratings[0] = rated.rating;
        }
      }
    });
  });


  res.status(RequestStatus.OK).json(friends);
}

exports.getFriendsWithRatedMedia = async function (req, res) {
  let userId = req.query.userId;
  let mediaId = req.query.mediaId;
  let following_list = await Follows.find({_user: userId}).exec();

  var ratedPromises = [];
  following_list.forEach((following) => {
    let friendId = following._following;
    ratedPromises.push(DataStoreUtils.getRatedByUserIdAndMediaId(friendId, mediaId));
  });

  var rateds;
  await Promise.all(ratedPromises).then((result) => {
    rateds = result;
  });

  let userPromises = [];
  let ratingsPromises = [];

  rateds.forEach((rated) => {
    rated = rated[0];
    if (rated) {
      var user = DataStoreUtils.getUserById(rated._user);
      userPromises.push(user);
      ratingsPromises.push(rated.rating);
    }
  });

  var friends;
  await Promise.all(userPromises).then((result) => {
    friends = result;
  });

  var ratings;
  await Promise.all(ratingsPromises).then((result) => {
    ratings = result;
  });

  for (i = 0; i < friends.length; i++) {
    friends[i]._ratings[0] = ratings[i];
  }

  res.status(RequestStatus.OK).json(friends);
}

var getFollowedFromFollow = async function(follow) {
  return User.findById(follow._following).exec();
};

var getFollowFromFollowed = async function(follow) {
  return User.findById(follow._user).exec();
};

var delete_action = function(action_id) {
  Action.remove({ _id: action_id}).exec();
};

var delete_action_from_user_history = async function(user_id, action_id) {
  User.findById(user_id, function (err, user) {
    let user_history = user._history;
    let index = user_history.indexOf(action_id);
    if (index > -1) {
      user_history.splice(index, 1);
    }
    user.save();
  });
};
