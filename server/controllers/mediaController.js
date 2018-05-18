var Media = require('../models/Media');

// Todas as séries
exports.index = function(req, res) {
    Media.find({})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        res.status(200).json(result);
    });
};

// Uma série
exports.media = function(req, res) {
    Media.findById(req.params.media_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        res.status(200).json(result);
    });
};

// Criar série
exports.create = function(req, res) {
    var media = new Media(req.body);

    media.save()
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((createdMedia) => {
        res.status(200).send(createdMedia);
    });
};

// Editar série
exports.update = function(req, res) {
    Media.findById(req.params.media_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((media) => {
        if (req.body.name) media.name = req.body.name;
        if (req.body.overview) media.overview = req.body.overview;
        if (req.body.release_date) media.release_date = req.body.release_date;
        if (req.body._directors) media._directors = req.body._directors;
        if (req.body._actors) media._actors = req.body._actors;
        if (req.body.imdb_id) media.imdb_id = req.body.imdb_id;
        if (req.body.genres) media.genres = req.body.genres;
        if (req.body.images) media.images = req.body.images;


        media.save()
        .catch((err) => {
            res.status(400).send(err);
        })
        .then((updatedMedia) => {
            res.status(200).json(updatedMedia);
        });
    });
};

// Deletar série
exports.delete = function(req, res) {
    Media.remove({ _id: req.params.media_id})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then(() => {
        res.status(200).send('Media removed.');
    });
};
