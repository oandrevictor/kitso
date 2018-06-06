var UserList = require('../models/UserList');
var ListItem = UserList.base.models.ListItem;
var User = require('../models/User');
var RequestStatus = require('../constants/requestStatus');
var RequestMsg = require('../constants/requestMsg');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');


// CRUD USERLIST ==================================================================================

exports.show = async function(req, res) {
  try {
    let userListId = req.params.userlist_id;
    let userList = await DataStoreUtils.getUserListById(userListId);
    let itens = userList.itens;
    let promises = itens.map(injectMediaJsonInItemList);
    Promise.all(promises).then(function(results) {
      results.sort(sortUserListByRank);
      userList.itens = results;
      res.status(RequestStatus.OK).json(userList);
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
    await saveUserList(userList);
    res.status(RequestStatus.OK).json(userList);
  } catch (err) {
    console.log(err);
    res.status(RequestStatus.BAD_REQUEST).send(err);
  }
};

exports.delete = async function(req, res) {
  try {
    let userId = req.headers.user_id;
    let userListId = req.params.userlist_id;
    await checkIfUserIsAuthorizedToManipulateList(userId, userListId);
    let deletedList = await removeListFromUserLists(userListId, userId);
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
    let userId = req.headers.user_id;
    let userListId = req.params.userlist_id;
    await checkIfUserIsAuthorizedToManipulateList(userId, userListId);
    let userList = await DataStoreUtils.getUserListById(userListId);
    let itens = userList.itens;
    let lastListIndex = itens.length;
    let newItem = new ListItem({
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
    let userId = req.headers.user_id;
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
    let userId = req.headers.user_id;
    let userListId = req.params.userlist_id;
    await checkIfUserIsAuthorizedToManipulateList(userId, userListId);
    let userList = await DataStoreUtils.getUserListById(userListId);
    let itens = userList.itens;
    changeRank(req.body.current_rank, req.body.new_rank, itens);
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


// AUXILIARY FUNCTIONS ============================================================================

var saveUserList = function(userList) {
  return userList.save();
};

var addListToUserLists = async function(userListId, userId) {
  let user = await DataStoreUtils.getUserById(userId);
  user._lists.push(userListId);
  return user.save();
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

var injectMediaJsonInItemList = async function(item) {
  let mediaId = item._media;
  let mediaObj = await DataStoreUtils.getMediaObjById(mediaId);
  item._media = mediaObj;
  return item;
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
