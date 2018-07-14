var UserList = require('../models/UserList');
var ListItem = UserList.base.models.ListItem;
var User = require('../models/User');
var RequestStatus = require('../constants/requestStatus');
var RequestMsg = require('../constants/requestMsg');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');
var RedisClient = require('../utils/lib/redisClient');
var TMDBController = require('../external/TMDBController');

const redisClient = RedisClient.createAndAuthClient();
const https = require('https');

// CRUD USERLIST ==================================================================================

exports.show = async function(req, res) {
  try {
    let userListId = req.params.userlist_id;
    let userList = await DataStoreUtils.getUserListById(userListId);
    let itens = userList.itens;
    let promises = itens.map(injectDataFromTmdb);
    Promise.all(promises).then(function(results) {
      results.sort(sortUserListByRank);
      userList.itens = results;
      if (req.user._id.toString() == userList._user) {
        res.status(RequestStatus.OK).json(userList);
      } else {
        if (!userList.is_private) {
          res.status(RequestStatus.OK).json(userList);
        } else {
          res.status(RequestStatus.OK).json({});
        }
      }

    })
  } catch (err) {
    console.log(err);
    res.status(RequestStatus.BAD_REQUEST).send(err);
  }
};

exports.create = async function(req, res) {
  try {
    let userList = new UserList(req.body);
    let userId = userList._user;
    await addListToUserLists(userList._id, userId);
    await saveUserList(userList);
    res.status(RequestStatus.OK).json(userList);
  } catch(err) {
    console.log(err);
    res.status(RequestStatus.BAD_REQUEST).send(err);
  }
};

exports.update = async function(req, res) {
  try {
    let userListId = req.params.userlist_id;
    let userList = await DataStoreUtils.getUserListById(userListId);
    if (req.body.description) {
      userList.description = req.body.description;
    }
    if (req.body.title) {
      userList.title = req.body.title;
    }
    if (req.body.is_private != null) {
      userList.is_private = req.body.is_private;
    }
    await saveUserList(userList);
    res.status(RequestStatus.OK).json(userList);
  } catch (err) {
    console.log(err);
    res.status(RequestStatus.BAD_REQUEST).send(err);
  }
};

exports.delete = async function(req, res) {
  try {
    let userId = req.user._id;
    let userListId = req.params.userlist_id;
    await checkIfUserIsAuthorizedToManipulateList(userId, userListId);
    let deletedList = await removeListFromUserLists(userListId, userId);

    await UserList.findById(userListId, function (err, userList) {
      let users = userList._followers;

      users.forEach((user) => {
        removeListFromFollowingUserLists(userListId, user);
      });
    });

    await DataStoreUtils.deleteListFromDb(userListId);
    res.status(RequestStatus.OK).json(deletedList);
  } catch (err) {
    console.log(err);
    if (err.message === RequestMsg.UNAUTHORIZED) {
      res.status(RequestStatus.UNAUTHORIZED).send(err.message);
    }
    res.status(RequestStatus.BAD_REQUEST).send(err.message);
  }
};

// LIST ITENS FUNCTIONS ===========================================================================

exports.addItem = async function(req, res) {
  try {
    let userId = req.user._id;
    let userListId = req.params.userlist_id;
    await checkIfUserIsAuthorizedToManipulateList(userId, userListId);
    let userList = await DataStoreUtils.getUserListById(userListId);
    let itens = userList.itens;
    let lastListIndex = itens.length;
    let newItem = new ListItem({
      date: req.body.date,
      ranked: lastListIndex + 1,
      _media: req.body._media
    });
    itens.push(newItem);
    await saveUserList(userList);
    res.status(RequestStatus.OK).json(userList);
  } catch(err) {
    console.log(err);
    if (err.message === RequestMsg.UNAUTHORIZED) {
      res.status(RequestStatus.UNAUTHORIZED).send(err.message);
    }
    res.status(RequestStatus.BAD_REQUEST).send(err.message);
  }
};

exports.removeItem = async function(req, res) {
  try {
    let userId = req.user._id;
    let userListId = req.params.userlist_id;
    await checkIfUserIsAuthorizedToManipulateList(userId, userListId);
    let userList = await DataStoreUtils.getUserListById(userListId);
    let itens = userList.itens;
    let itemToRemoveRank = req.params.item_rank;
    if (itemToRemoveRank > itens.length) {
      res.status(RequestStatus.BAD_REQUEST);
    }
    removeRankedItemFromList(itemToRemoveRank, itens);
    await saveUserList(userList);
    res.status(RequestStatus.OK).json(userList);
  } catch(err) {
    console.log(err);
    if (err.message === RequestMsg.UNAUTHORIZED) {
      res.status(RequestStatus.UNAUTHORIZED).send(err.message);
    }
    res.status(RequestStatus.BAD_REQUEST).send(err.message);
  }
};

exports.changeItemRank = async function(req, res) {
  try {
    let userId = req.user._id;
    let userListId = req.params.userlist_id;
    await checkIfUserIsAuthorizedToManipulateList(userId, userListId);
    let userList = await DataStoreUtils.getUserListById(userListId);
    let itens = userList.itens;
    changeRank(req.body.current_rank, req.body.new_rank, itens);
    userList.markModified('itens');
    await saveUserList(userList);
    res.status(RequestStatus.OK).json(userList);
  } catch(err) {
    console.log(err);
    if (err.message === RequestMsg.UNAUTHORIZED) {
      res.status(RequestStatus.UNAUTHORIZED).send(err.message);
    }
    res.status(RequestStatus.BAD_REQUEST).send(err.message);
  }
};


// FOLLOW/UNFOLLOW USERLIST FUNCTIONS ============================================================================

exports.followUserList = async function(req, res) {
  try {
    let userListId = req.params.userlist_id;
    let notifications_enabled = req.body.notifications_enabled;

    await addListToFollowingUserLists(userListId, req.user._id, notifications_enabled);
    await addFollowerToUserList(userListId, req.user._id);

    res.status(RequestStatus.OK).json();
  } catch(err) {
    console.log(err);
    res.status(RequestStatus.BAD_REQUEST).send(err);
  }
};

exports.unfollowUserList = async function(req, res) {
  try {
    let userListId = req.params.userlist_id;

    await removeListFromFollowingUserLists(userListId, req.user._id);
    await removeFollowerFromUserList(userListId, req.user._id);

    res.status(RequestStatus.OK).json();
  } catch(err) {
    console.log(err);
    res.status(RequestStatus.BAD_REQUEST).send(err);
  }
};

exports.is_followed = async function(req, res) {
  let userListId = req.query.userlist_id;
  let user_id = req.user._id;

  try {
    let user_followed = await userHasFollowed(userListId, user_id);

    data = {
      "followed": user_followed
    };

    res.status(RequestStatus.OK).json(data);
  } catch (err) {
    console.log(err);
    res.status(RequestStatus.BAD_REQUEST).json(err);
  }
};

// AUXILIARY FUNCTIONS ============================================================================

exports.addAndSave = async function(userList, userId){
  await saveUserList(userList);
  await addListToUserLists(userList._id, userId);
}

var saveUserList = function(userList) {
  return userList.save();
};

var addListToUserLists = async function(userListId, userId) {
  let user = await DataStoreUtils.getUserById(userId);
  user._lists.push(userListId);
  return user.save();
};

var addListToFollowingUserLists = async function(userListId, userId, notifications_enabled) {
  let user = await DataStoreUtils.getUserById(userId);

  data = {
    "userListId": userListId,
    "notifications_enabled": notifications_enabled
  };

  user._following_lists.push(data);
  return user.save();
};

var addFollowerToUserList = async function(userListId, userId) {
  let userList = await DataStoreUtils.getUserListById(userListId);

  userList._followers.push(userId);
  return userList.save();
};

var removeListFromUserLists = function(userListId, userId) {
  User.findById(userId, function (err, user) {
    let userLists = user._lists;
    let index = userLists.indexOf(userListId);

    if (index > -1) {
      userLists.splice(index, 1);
    }
    return user.save();
  });
};

var removeListFromFollowingUserLists = function(userListId, userId) {
  User.findById(userId, function (err, user) {
    let userLists = user._following_lists;

    for(let i=0; i <  user._following_lists.length; i++) {
      if (userListId.toString() === user._following_lists[i].userListId.toString()) {
        userLists.splice(i, 1);

        return user.save();
      }
    }
  });
};

var removeFollowerFromUserList = async function(userListId, userId) {
  UserList.findById(userListId, function (err, userList) {
    let users = userList._followers;
    let index = users.indexOf(userId);
    if (index > -1) {
      users.splice(index, 1);
    }
    return userList.save();
  });
};

var userHasFollowed = async function(userListId, userId) {
  let user = await DataStoreUtils.getUserById(userId);

  for(let i=0; i <  user._following_lists.length; i++) {
    if (userListId.toString() === user._following_lists[i].userListId.toString()) {
      return true;
    }
  }

  return false;
};

var userHasList = function(user, listId) {
  var userLists = user._lists;
  let userHasList = false;
  for(var i=0; i < userLists.length; i++) {
    if (listId == userLists[i]) {
      userHasList = true;
    }
  }
  return userHasList;
};

var injectDataFromTmdb = async function(item) {
  let itemJson = JSON.parse(JSON.stringify(item));
  let mediaId = itemJson._media;
  let mediaObj= await DataStoreUtils.getMediaObjById(mediaId);
  if (mediaObj.__t == "Movie") {
    itemJson._media = await TMDBController.getMovie(mediaObj._tmdb_id);
  } else if  (mediaObj.__t == "Episode") {
    response = await TMDBController.getEpisode(mediaObj._tmdb_id);
    itemJson._media = response
  } else if (mediaObj.__t == "TvShow") {
    itemJson._media = await TMDBController.getShow(mediaObj._tmdb_id);
  } if (mediaObj.__t == "Season") {
    tv_show = await DataStoreUtils.getMediaObjById(mediaObj._tvshow_id);
    response = await TMDBController.getSeason(tv_show._tmdb_id, mediaObj.number);
    itemJson._media = JSON.parse(response)
  }
  itemJson._media.__t = mediaObj.__t;
  itemJson._media._id = mediaObj._id;

  return itemJson;
};

var removeRankedItemFromList = function(itemToRemoveRank, itens) {
  var indexOfItemToRemove = -1;
  for(var i=0; i < itens.length; i++) {
    let item = itens[i];
    if (item.ranked == itemToRemoveRank) {
      indexOfItemToRemove = i;
    }
  }
  if (indexOfItemToRemove == -1) {
    throw new Error('There is no such item with this rank in this list.');
  } else {
    itens.splice(indexOfItemToRemove, 1);
    for(var i=0; i < itens.length; i++) {
      let item = itens[i];
      if (item.ranked > itemToRemoveRank) {
        item.ranked--;
      }
    }
  }
};

var changeRank = function(itemCurrentRank, itemNewRank, itens) {
  if (itemNewRank > itens.length) {
    throw new Error('There is no such item with this rank in this list.');
  }
  for(var i=0; i < itens.length; i++) {
    let item = itens[i];
    if (item.ranked == itemCurrentRank) {
      item.ranked = itemNewRank;
      changedRank = true;
    } else {
      if (itemCurrentRank < itemNewRank) { // ex: if i am 3 and i want to move to 5
        if (item.ranked > itemCurrentRank && item.ranked <= itemNewRank) {
          item.ranked--;
        }
      } else { // ex: if i am 5 and i want to move to 3
        if (item.ranked >= itemNewRank) {
          item.ranked++;
        }
      }
    }
  }
};

var checkIfUserIsAuthorizedToManipulateList = async function(userId, userListId) {
  let user = await DataStoreUtils.getUserById(userId);
  let isAuthorized = userHasList(user, userListId);
  if (!isAuthorized) {
    throw new Error(RequestMsg.UNAUTHORIZED);
  }
};

var sortUserListByRank = function(itemA, itemB) {
  return itemA.ranked - itemB.ranked;
};
