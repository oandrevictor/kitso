var Watched = require('../models/Watched');
var Action = require('../models/Action');
var User = require('../models/User');

const WATCHED_ACTION_TYPE = "watched";

exports.index = function(req, res) {
    let user_id = req.params.user_id;
    Watched.find({_user: user_id})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((watched_list) => {
        res.status(200).json(watched_list);
    });
};

exports.create = async function(req, res) {
    var watched = new Watched(req.body);
    let user_id = watched._user;
    let action = await create_action(user_id, watched._id);  
    watched._action = action._id;
    await add_action_to_user_history(user_id, action._id);
    watched.save()    
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((createdWatched) => {
        res.status(200).json(createdWatched);
    });
};

exports.delete = async function(req, res) {
    let watched_id = req.params.watched_id;
    try {
        let watched = await find_watched_obj(watched_id);
        let user_id = watched._user;
        let action_id = watched._action;
        delete_action(action_id);  
        delete_action_from_user_history(user_id, action_id);
    } catch (err) {
        res.status(400).send(err);
    }
    Watched.remove({ _id: watched_id})  
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((createdWatched) => {
        res.status(200).json(createdWatched);
    });
};

var create_action = async function(user_id, watched_id) {
    var action = new Action({
        _user: user_id,
        date: new Date(),
        _action: watched_id,
        action_type: WATCHED_ACTION_TYPE,
    });
    return action.save();
}

var delete_action = function(action_id) {
    Action.remove({ _id: action_id}).exec();
}

var add_action_to_user_history = async function(user_id, action_id) {        
    User.findById(user_id, function (err, user) {
        let user_history = user._history;
        user_history.push(action_id);
        return user.save();
    });
}

var delete_action_from_user_history = async function(user_id, action_id) {        
    User.findById(user_id, function (err, user) {
        let user_history = user._history;
        let index = user_history.indexOf(action_id);
        if (index > -1) {
            user_history.splice(index, 1);
        }
        user.save();
    });
}

var find_watched_obj = async function(watched_id) {
    return Watched.findById(watched_id).exec(); 
}