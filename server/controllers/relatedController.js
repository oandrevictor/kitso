var Related = require('../models/Related');
var RequestStatus = require('../constants/requestStatus');

exports.index = function(req, res) {
    Related.find({})
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((result) => {
        res.status(RequestStatus.OK).json(result);
    });
};

exports.show = function(req, res) {
    Related.findById(req.params.related_id)
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((result) => {
        res.status(RequestStatus.OK).json(result);
    });
};

exports.create = function(req, res) {
    var related = new Related(req.body);

    related.save()
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((createdRelated) => {
        res.status(RequestStatus.OK).send('Related created.');
    });
};

exports.update = function(req, res) {
    Related.findById(req.params.related_id)
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((related) => {
        if (req.body._news) related._news = req.body._news;
        if (req.body._media ) related._media  = req.body._media ;
        if (req.body._person) related._person = req.body._person;

        related.save()
        .catch((err) => {
            res.status(RequestStatus.BAD_REQUEST).send(err);
        })
        .then((updatedRelated) => {
            res.status(RequestStatus.OK).json(updatedRelated);
        });
    });
};

exports.delete = function(req, res) {
    Related.remove({ _id: req.params.related_id})
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then(() => {
        res.status(RequestStatus.OK).send('Related deleted.');
    });
};
