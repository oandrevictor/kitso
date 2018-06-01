var Follows = require('../models/Follows');
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
}

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
}

exports.create = async function(req, res) {
    var follow = new Follows(req.body);
    let user_id = follow._user;
    let action = await DataStoreUtils.createAction(user_id, follow._id, ActionType.FOLLOWED);
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

var getFollowedFromFollow = async function(follow) {
    return User.findById(follow._following).exec();
}

var getFollowFromFollowed = async function(follow) {
    return User.findById(follow._user).exec();
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
