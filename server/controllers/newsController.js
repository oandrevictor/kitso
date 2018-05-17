var News = require('../models/News');

exports.index = function(req, res) {
    News.find({})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        res.status(200).json(result);
    });
};

exports.show = function(req, res) {
    News.findById(req.params.news_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        res.status(200).json(result);
    });
};

exports.create = function(req, res) {
    var news = new News(req.body);

    news.save()
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((createdNews) => {
        res.status(200).send('News created.');
    });
};

exports.update = function(req, res) {
    News.findById(req.params.news_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((action) => {
        if (req.body._posted_by) action.name = req.body._posted_by;
        if (req.body.link) action._action = req.body.link;
        if (req.body.date) action._user = req.body.date;
        if (req.body._related) action_type = req.body._related;
        
        action.save()
        .catch((err) => {
            res.status(400).send(err);
        })
        .then((updateAction) => {
            res.status(200).json(updateAction);
        });
    });
};

exports.delete = function(req, res) {
    News.remove({ _id: req.params.news_id})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then(() => {
        res.status(200).send('News deleted.');
    });
};