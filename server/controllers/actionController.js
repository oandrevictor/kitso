var Action = require('../models/Action');
var User = require('../models/User');
var Rated = require('../models/Rated');
var Watched = require('../models/Watched');
var Follows = require('../models/Follows');
var FollowsṔage = require('../models/FollowsPage');

exports.index = async function(req, res) {
    let action_list, promises;
    try {
        action_list = await Action.find({}).exec();
        promises = action_list.map(inject_media_json);
    } catch (err) {
        res.status(400).json(err);
    }

    Promise.all(promises).then(function(results) {
        res.status(200).json(results);
    })
};


// Uma ação
exports.show = async function(req, res) {
    Action.findById(req.params.action_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        inject_media_json(result).then(function(results) {
            res.status(200).json(results);
        });
    });
};

var inject_media_json = async function(action) {
    let user_id = action._user;
    let action_id = action._action;

    user_obj = await getUser(user_id);
    action_obj = await getAction(action.action_type, action_id);

    let action_complete = action;
    action_complete._user = user_obj;
    action_complete._action = action_obj;

    return action_complete;
} 

var getUser = async function(id) {
    return User.findById(id).exec();
}

var getAction = async function(type, id) {
    if (type == 'rated') {
        return Rated.findById(id).exec();
    } else if (type == 'watched') {
        return Watched.findById(id).exec();
    } else if (type == 'followed') {
        return Follows.findById(id).exec();
    } else {
        return FollowsṔage.findById(id).exec();
    }
}

// Criar ação
exports.create = function(req, res) {
    var action = new Action(req.body);

    action.save()
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((createdAction) => {
        res.status(200).send('Ação criada.');
    });
};

// Editar ação
exports.update = function(req, res) {
    Action.findById(req.params.action_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((action) => {
        if (req.body.name) action.name = req.body.name;
        if (req.body._action) action._action = req.body._action;
        if (req.body._user) action._user = req.body._user;
        if (req.body.action_type) action_type = req.body.action_type;
        
        action.save()
        .catch((err) => {
            res.status(400).send(err);
        })
        .then((updateAction) => {
            res.status(200).json(updateAction);
        });
    });
};

// Deletar ação
exports.delete = function(req, res) {
    Action.remove({ _id: req.params.action_id})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then(() => {
        res.status(200).send('Ação removida.');
    });
};