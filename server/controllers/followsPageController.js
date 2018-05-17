var FollowsPage = require('../models/FollowsPage');
var Action = require('../models/Action');
var User = require('../models/User');

const FOLLOWED_ACTION_TYPE = "followed";

exports.index = async function(req, res) {
    let user_id = req.params.user_id;
    let following_list;
    try {
        following_list = await find_user_following_list(user_id);
        
        res.status(200).json(following_list);
    } catch (err) {
        res.status(400).json(err);
    }
};

exports.is_following = async function(req, res) {
    let user_id = req.query.user_id;
    let following_id = req.query.following_id;
    try {
        let user_is_following = await user_is_following(user_id, following_id);
        if (user_is_following.length > 0) {
            res_json = {
                "is_following": true,
                "following_id": user_is_following[0]._id
            }
            res.status(200).json(res_json);
        } else {
            json_not_following = {"is_following": false};
            res.status(200).json(json_not_following);
        }
    } catch (err) {
        res.status(400).json(err);
    }
}


exports.create = async function(req, res) {
    var follow = new FollowsPage(req.body);
    let user_id = follow._user;
    let action = await create_action(user_id, follow._id);
    follow._action = action._id;
    await add_action_to_user_history(user_id, action._id);

    follow.save()
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((createdFollow) => {
        res.status(200).send(createdFollow);
    });
};

exports.delete = async function(req, res) {
    let follow_id = req.params.followsPage_id;
    try {
        let followed = await find_followed_obj(follow_id);
        let user_id = followed._user;
        let action_id = followed._action;
        delete_action(action_id);
        delete_action_from_user_history(user_id, action_id);
    } catch (err) {
        res.status(400).send(err);
    }

    FollowsPage.remove({ _id: req.params.followsPage_id})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then(() => {
        res.status(200).send('Follow removido.');
    });
};

var find_watched_obj = async function(watched_id) {
    return FollowsPage.findById(follow_id).exec();
}

var create_action = async function(user_id, follow_id) {
    var action = new Action({
        _user: user_id,
        date: new Date(),
        _action: follow_id,
        action_type: FOLLOWED_ACTION_TYPE,
    });
    return action.save();
}

var add_action_to_user_history = async function(user_id, action_id) {
    User.findById(user_id, function (err, user) {
        let user_history = user._history;
        user_history.push(action_id);
        return user.save();
    });
}

var delete_action = function(action_id) {
    Action.remove({ _id: action_id}).exec();
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

var user_is_following = async function(user_id, following_id) {
    return FollowsPage.find({_user: user_id, _following: following_id}).exec();
}

var find_user_following_list = async function(user_id) {
    return FollowsPage.find({_user: user_id}).exec();
}