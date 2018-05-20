var Follows = require('../models/Follows');
var Action = require('../models/Action');
var User = require('../models/User');

const FOLLOWED_ACTION_TYPE = "followed";

exports.index = async function(req, res) {
    let user_id = req.params.user_id;
    let following_list;
    try {
        following_list = await Follows.find({_user: user_id}).exec();

        res.status(200).json(following_list);
    } catch (err) {
        res.status(400).json(err);
    }
};

exports.is_following = async function(req, res) {
    let user_id = req.query.user_id;
    let following_id = req.query.following_id;

    Follows.find({_user: user_id, _following: following_id}, function(err, result) {
        if (err) {
            res.status(400).json(err);
        } else {
            if (result.length > 0) {
                res_json = {
                    "is_following": true,
                    "following_id": result[0]._id
                }
                res.status(200).json(res_json);
            } else {
                json_not_following = {"is_following": false};
                res.status(200).json(json_not_following);
            }
        }
    });
}

exports.following_me = async function(req, res) {
    let user_id = req.params.user_id;
    let following_me_list;
    try {
        following_me_list = await Follows.find({_following: user_id}).exec();

        res.status(200).json(following_me_list);
    } catch (err) {
        res.status(400).json(err);
    }
}

exports.create = async function(req, res) {
    var follow = new Follows(req.body);
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
    let follow_id = req.params.follow_id;

    Follows.findById(follow_id, function(err, followed) {
        if (!followed || err) {
            res.status(400).send("Follow inexistente");
        } else {
            let user_id = followed._user;
            let action_id = followed._action;
            delete_action(action_id);
            delete_action_from_user_history(user_id, action_id);

            Follows.remove({ _id: follow_id})
            .catch((err) => {
                res.status(400).send(err);
            })
            .then(() => {
                res.status(200).send('Follow removido.');
            });
        }
    });
};

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
