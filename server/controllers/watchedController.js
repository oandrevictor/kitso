var Watched = require('../models/Watched');
var Action = require('../models/Action');
var User = require('../models/User');

const WATCHED_ACTION_TYPE = "watched";

exports.create = async function(req, res) {
    var watched = new Watched(req.body);
    let user_id = watched._user;
    let action = await create_action(user_id, watched._id);  
    watched._action = action;
    await add_action_to_user_history(user_id, action._id);
    watched.save()    
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

var add_action_to_user_history = async function(user_id, action_id) {        
    User.findById(user_id, async function (err, user) {
        let user_history = user._history;
        user_history.push(action_id);
        return user.save();
    });
}
