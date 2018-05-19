var UserList = require('../models/UserList');
var User = require('../models/User');

exports.create = async function(req, res) {
    try {
        let userList = new UserList(req.body);
        let userId = userList._user;
        await addListToUserLists(userList._id, userId);
        let createdUserList = await saveUserList(userList);
        res.status(200).json(userList);    
    } catch(err) {
        console.log(err);
        res.status(400).send(err);
    }
};

var saveUserList = function(userList) {
    return userList.save();
}

var addListToUserLists = function(userListId, userId) {
    User.findById(userId, function (err, user) {
        user._lists.push(userListId);
        return user.save();
    });    
}