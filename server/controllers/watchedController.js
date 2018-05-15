var Watched = require('../models/Watched');
var Action = require('../models/Action');
var User = require('../models/User');
var Media = require('../models/Media');

const WATCHED_ACTION_TYPE = "watched";

exports.index = async function(req, res) {
    let user_id = req.params.user_id;
    let watched_list, promises;
    try {
        watched_list = await find_user_watched_list(user_id);
        promises = watched_list.map(inject_media_json);
    } catch (err) {
        res.status(400).json(err);
    }
    Promise.all(promises).then(function(results) {
        res.status(200).json(results);
    })
};

exports.is_watched = async function(req, res) {
    let user_id = req.query.user_id;
    let media_id = req.query.media_id;
    try {
        let user_did_watched = await user_has_watched(user_id, media_id);
        if (user_did_watched.length > 0) {
            res_json = {
                "is_watched": true,
                "watched_id": user_did_watched[0]._id
            }
            res.status(200).json(res_json);
        } else {
            json_not_watched = {"is_watched": false};
            res.status(200).json(json_not_watched);
        }
    } catch (err) {
        res.status(400).json(err);
    }
}

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

exports.update = async function(req, res) {
    let watched_id = req.params.watched_id;
    try {
        var watched = await find_watched_obj(watched_id);
    } catch (err) {
        // if there is no watched with informed id
        res.status(400).send(err);
    }

    if (req.body.date) {
        watched.date = req.body.date;
    }

    watched.save()
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((updateWatched) => {
        res.status(200).json(updateWatched);
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

var find_user_watched_list = async function(user_id) {
    return Watched.find({_user: user_id}).exec();
}

var inject_media_json = async function(watched_obj) {
    let media_id = watched_obj._media;
    let media_obj = await get_media_obj(media_id);
    let watched_with_full_media = watched_obj;
    watched_with_full_media._media = media_obj
    return watched_with_full_media;
}

var get_media_obj = async function(media_id) {
    return Media.findById(media_id).exec();
}

var user_has_watched = async function(user_id, media_id) {
    return Watched.find({_user: user_id, _media: media_id}).exec();
}
