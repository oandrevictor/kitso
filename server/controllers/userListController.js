var UserList = require('../models/UserList');
var ListItem = UserList.base.models.ListItem;
var User = require('../models/User');

const UNAUTHORIZED = 401;
const BAD_REQUEST = 400;
const OK = 200;

exports.create = async function(req, res) {
    try {
        let userList = new UserList(req.body);
        let userId = userList._user;
        await addListToUserLists(userList._id, userId);
        await saveUserList(userList);
        res.status(OK).json(userList);    
    } catch(err) {
        console.log(err);
        res.status(BAD_REQUEST).send(err);
    }
};

exports.delete = async function(req, res) {
    try {
        let userId = req.headers.user_id;
        let userListId = req.params.userlist_id;
        let user = await getUser(userId);
        let isAuthorized = userHasList(user, userListId);
        if (!isAuthorized) {            
            res.status(UNAUTHORIZED);
        }
        let deletedList = await removeListFromUserLists(userListId, userId);
        await deleteListFromDb(userListId);
        res.status(OK).json(deletedList);
    } catch (err) {
        console.log(err);
        res.status(BAD_REQUEST).send(err);
    }
}

exports.addItem = async function(req, res) {
    try {
        let userId = req.headers.user_id;
        let userListId = req.params.userlist_id;
        let user = await getUser(userId);
        let isAuthorized = userHasList(user, userListId);
        if (!isAuthorized) {            
            res.status(UNAUTHORIZED);
        }
        let userList = await getUserList(userListId);
        let itens = userList.itens;
        let lastListIndex = itens.length;
        let newItem = new ListItem({
            ranked: lastListIndex + 1, 
            _media: req.body._media
        });
        itens.push(newItem);
        await saveUserList(userList);
        // await newItem.save();
        res.status(OK).json(userList); 
    } catch(err) {
        console.log(err);
        res.status(BAD_REQUEST).send(err);
    }    
}

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
