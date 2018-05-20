var UserList = require('../models/UserList');
var ListItem = UserList.base.models.ListItem;
var User = require('../models/User');
var Media = require('../models/Media');


const UNAUTHORIZED_CODE = 401;
const UNAUTHORIZED_MSG = "Unauthorized!";
const BAD_REQUEST_CODE = 400;
const OK_CODE = 200;


// CRUD USERLIST ==================================================================================

exports.show = async function(req, res) {
    try {
        let userListId = req.params.userlist_id;
        let userList = await getUserList(userListId);
        let itens = userList.itens;
        let promises = itens.map(getMediaJson);
        Promise.all(promises).then(function(results) {
            res.status(OK_CODE).json(results);
        })
    } catch (err) {
        console.log(err)
        res.status(BAD_REQUEST_CODE).send(err);
    }    
}

exports.create = async function(req, res) {
    try {
        let userList = new UserList(req.body);
        let userId = userList._user;
        await addListToUserLists(userList._id, userId);
        await saveUserList(userList);
        res.status(OK_CODE).json(userList);    
    } catch(err) {
        console.log(err);
        res.status(BAD_REQUEST_CODE).send(err);
    }
};

exports.update = async function(req, res) {
    try {
        let userListId = req.params.userlist_id;
        let userList = await getUserList(userListId);
        if (req.body.description) {
            userList.description = req.body.description;
        }
        if (req.body.title) {
            userList.title = req.body.title;
        }
        await saveUserList(userList);
        res.status(OK_CODE).json(userList);
    } catch (err) {
        console.log(err)
        res.status(BAD_REQUEST_CODE).send(err);
    }
};

exports.delete = async function(req, res) {
    try {
        let userId = req.headers.user_id;
        let userListId = req.params.userlist_id;
        await checkIfUserIsAuthorizedToManipulateList(userId, userListId);
        let deletedList = await removeListFromUserLists(userListId, userId);
        await deleteListFromDb(userListId);
        res.status(OK_CODE).json(deletedList);
    } catch (err) {
        console.log(err);
        if (err.message === UNAUTHORIZED_MSG) {
            res.status(UNAUTHORIZED_CODE).send(err.message);
        }
        res.status(BAD_REQUEST_CODE).send(err.message);
    }
}


// LIST ITENS FUNCTIONS ===========================================================================

exports.addItem = async function(req, res) {
    try {
        let userId = req.headers.user_id;
        let userListId = req.params.userlist_id;
        await checkIfUserIsAuthorizedToManipulateList(userId, userListId);
        let userList = await getUserList(userListId);
        let itens = userList.itens;
        let lastListIndex = itens.length;
        let newItem = new ListItem({
            ranked: lastListIndex + 1, 
            _media: req.body._media
        });
        itens.push(newItem);
        await saveUserList(userList);
        res.status(OK_CODE).json(userList); 
    } catch(err) {
        console.log(err);
        if (err.message === UNAUTHORIZED_MSG) {
            res.status(UNAUTHORIZED_CODE).send(err.message);
        }
        res.status(BAD_REQUEST_CODE).send(err.message);
    }    
}

exports.removeItem = async function(req, res) {
    try {
        let userId = req.headers.user_id;
        let userListId = req.params.userlist_id;
        await checkIfUserIsAuthorizedToManipulateList(userId, userListId);
        let userList = await getUserList(userListId);
        let itens = userList.itens;
        let itemToRemoveRank = req.params.item_rank;
        if (itemToRemoveRank > itens.length) {            
            res.status(BAD_REQUEST_CODE);
        }
        removeItemFromList(itemToRemoveRank, itens);
        await saveUserList(userList);
        res.status(OK_CODE).json(userList); 
    } catch(err) {
        console.log(err);
        if (err.message === UNAUTHORIZED_MSG) {
            res.status(UNAUTHORIZED_CODE).send(err.message);
        }
        res.status(BAD_REQUEST_CODE).send(err.message);
    }  
}

exports.changeItemRank = async function(req, res) {
    try {
        let userId = req.headers.user_id;
        let userListId = req.params.userlist_id;
        await checkIfUserIsAuthorizedToManipulateList(userId, userListId);
        let userList = await getUserList(userListId);
        let itens = userList.itens;
        changeRank(req.body.current_rank, req.body.new_rank, itens);
        await saveUserList(userList);
        res.status(OK_CODE).json(userList); 
    } catch(err) {
        console.log(err);
        if (err.message === UNAUTHORIZED_MSG) {
            res.status(UNAUTHORIZED_CODE).send(err.message);
        }
        res.status(BAD_REQUEST_CODE).send(err.message);
    } 
}


// AUXILIARY FUNCTIONS ============================================================================

var saveUserList = function(userList) {
    return userList.save();
}

var addListToUserLists = function(userListId, userId) {
    User.findById(userId, function (err, user) {
        user._lists.push(userListId);
        return user.save();
    });    
}

var removeListFromUserLists = function(userListId, userId) {
    User.findById(userId, function (err, user) {
        let userLists = user._lists;
        let index = userLists.indexOf(userListId);
        if (index > -1) {
            userLists.splice(index, 1);
        }
        return user.save();
    });
}

var deleteListFromDb = function(listId) {
    return UserList.remove({ _id: listId}).exec();
}

var getUserList = function(userListId) {
    return UserList.findById(userListId).exec(); 
}

var getUser = function(userId) {
    return User.findById(userId).exec(); 
}

var userHasList = function(user, listId) {
    var userLists = user._lists;
    let userHasList = false;
    for(var i=0; i < userLists.length; i++) {
        if (listId == userLists[i]) {
            userHasList = true;
        }
    }
    return userHasList;
}

var getMediaJson = function(item) {
    let mediaId = item._media;
    return Media.findById(mediaId).exec();
}

var removeItemFromList = function(itemToRemoveRank, itens) {
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
}

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
}

var checkIfUserIsAuthorizedToManipulateList = async function(userId, userListId) {
    let user = await getUser(userId);
    let isAuthorized = userHasList(user, userListId);
    if (!isAuthorized) { 
        throw new Error(UNAUTHORIZED_MSG);
    }
}