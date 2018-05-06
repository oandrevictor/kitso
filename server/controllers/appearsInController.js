var AppearsIn = require('../models/AppearsIn');

exports.index = function(req, res) {
    AppearsIn.find({})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        res.status(200).json(result);
    });
};

exports.show = function(req, res) {
    AppearsIn.findById(req.params.appearsin_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        res.status(200).json(result);
    });
};

exports.create = function(req, res) {
    var appearsin = new AppearsIn(req.body);
    appearsin.save()
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((createdAppearsIn) => {
        res_json = {
            "message": "AppearsIn created",
            "data": {
                "appearsInId": createdAppearsIn._id,
            }            
        }
        res.status(200).json(res_json);
    });
};

exports.update = function(req, res) {
    AppearsIn.findById(req.params.appearsin_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((appearsin) => {
        if (req.body._person) appearsin._person = req.body._person;
        if (req.body._media) appearsin._media = req.body._media;
        appearsin.save()
        .catch((err) => {
            res.status(400).send(err);
        })
        .then((updateAppearsIn) => {
            res.status(200).json(updateAppearsIn);
        });
    });
};

exports.delete = function(req, res) {
    AppearsIn.remove({ _id: req.params.appearsin_id})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then(() => {
        res.status(200).send('AppearsIn removed.');
    });
};
