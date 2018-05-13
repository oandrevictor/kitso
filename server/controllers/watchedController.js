var Watched = require('../models/Watched');
var Action = require('../models/Action');

exports.create = function(req, res) {
    var watched = new Watched(req.body);
    watched.save()
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((createdWatched) => {
        // criar action de watch filme e add no usuário
        var action = new Action();
        action.action_type = 'watched';
        res_json = {
            "message": "Watched action created",
            "data": {
                "watchedId": createdWatched._id,
            }            
        }
        res.status(200).json(res_json);
    });
};
