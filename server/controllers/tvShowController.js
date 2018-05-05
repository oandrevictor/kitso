var Show = require('../models/TvShow');

// Todas as séries
exports.index = function(req, res) {
    Show.find({})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        res.status(200).json(result);
    });
};

// Uma série
exports.show = function(req, res) {
    Show.findById(req.params.show_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        res.status(200).json(result);
    });
};

// Criar série
exports.create = function(req, res) {
    var show = new Show(req.body);

    show.save()
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((createdShow) => {
        res.status(200).send('Show created.');
    });
};

// Editar série
exports.update = function(req, res) {
    Show.findById(req.params.show_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((show) => {
        if (req.body.name) show.name = req.body.name;
        if (req.body.overview) show.overview = req.body.overview;
        if (req.body.release_date) show.release_date = req.body.release_date;
        if (req.body._directors) show._directors = req.body._directors;
        if (req.body._actors) show._actors = req.body._actors;
        if (req.body.imdb_id) show.imdb_id = req.body.imdb_id;
        if (req.body.genres) show.genres = req.body.genres;
        if (req.body.poster) show.poster = req.body.poster;
        if (req.body.seasons) show.seasons = req.body.seasons;
        

        show.save()
        .catch((err) => {
            res.status(400).send(err);
        })
        .then((updatedShow) => {
            res.status(200).json(updatedShow);
        });
    });
};

// Deletar série
exports.delete = function(req, res) {
    Show.remove({ _id: req.params.show_id})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then(() => {
        res.status(200).send('Show removed.');
    });
};
