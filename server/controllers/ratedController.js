var Rated = require('../models/Rated');
var Action = require('../models/Action');
var User = require('../models/User');
var Media = require('../models/Media');

const RATED_ACTION_TYPE = "rated";

exports.index = async function(req, res) {
    let user_id = req.params.user_id;
    let rated_list, promises;
    try {
        rated_list = await find_user_rated_list(user_id);
        promises = rated_list.map(inject_media_json);
    } catch (err) {
        res.status(400).json(err);
    }
    Promise.all(promises).then(function(results) {
        res.status(200).json(results);
    })
};

exports.is_rated = async function(req, res) {
    let user_id = req.query.user_id;
    let media_id = req.query.media_id;
    try {
        let user_did_rated = await user_has_rated(user_id, media_id);
        if (user_did_rated.length > 0) {
            res_json = {
                "is_rated": true,
                "rated_id": user_did_rated[0]._id
            }
            res.status(200).json(res_json);
        } else {
            json_not_rated = {"is_rated": false};
            res.status(200).json(json_not_rated);
        }
    } catch (err) {
        res.status(400).json(err);
    }
}

exports.create = async function(req, res) {
    var rated = new Rated(req.body);
    let user_id = rated._user;
    let action = await create_action(user_id, rated._id);
    rated._action = action._id;
    await add_action_to_user_history(user_id, action._id);
    rated.save()
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((createdRated) => {
        res.status(200).json(createdRated);
    });
};

exports.update = async function(req, res) {
    let rated_id = req.params.rated_id;
    try {
        var rated = await find_rated_obj(rated_id);
    } catch (err) {
        // if there is no rated with informed id
        res.status(400).send(err);
    }

    if (req.body.date) {
        rated.date = req.body.date;
    }

    if (req.body.rating) {
        rated.rating = req.body.rating;
    }

    rated.save()
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((updateRated) => {
        res.status(200).json(updateRated);
    });
};

exports.delete = async function(req, res) {
    let rated_id = req.params.rated_id;
    try {
        let rated = await find_rated_obj(rated_id);
        let user_id = rated._user;
        let action_id = rated._action;
        delete_action(action_id);
        delete_action_from_user_history(user_id, action_id);
    } catch (err) {
        res.status(400).send(err);
    }
    Rated.remove({ _id: rated_id})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((createdRated) => {
        res.status(200).json(createdRated);
    });
};

var create_action = async function(user_id, rated_id) {
    var action = new Action({
        _user: user_id,
        date: new Date(),
        _action: rated_id,
        action_type: RATED_ACTION_TYPE,
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

var find_rated_obj = async function(rated_id) {
    return Rated.findById(rated_id).exec();
}

var find_user_rated_list = async function(user_id) {
    return Rated.find({_user: user_id}).exec();
}

var inject_media_json = async function(rated_obj) {
    let media_id = rated_obj._media;
    let media_obj = await get_media_obj(media_id);
    let rated_with_full_media = rated_obj;
    rated_with_full_media._media = media_obj
    return rated_with_full_media;
}

var get_media_obj = async function(media_id) {
    return Media.findById(media_id).exec();
}

var user_has_rated = async function(user_id, media_id) {
    return Rated.find({_user: user_id, _media: media_id}).exec();
}
