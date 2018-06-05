var Movie = require('../models/Movie');
var RequestStatus = require('../constants/requestStatus');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');


exports.index = function(req, res) {
    Movie.find({})
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((result) => {
        res.status(RequestStatus.OK).json(result);
    });
};

exports.show = function(req, res) {
    Movie.findById(req.params.movie_id)
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((result) => {
        res.status(RequestStatus.OK).json(result);
    });
};

exports.create = function(req, res) {
    var movie = new Movie(req.body);

    movie.save()
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((createdMovie) => {
        res_json = {
            "message": "Movie created.",
            "data": {
                "movieId": createdMovie._id,
            }
        }
        res.status(RequestStatus.OK).json(res_json);
    });
};

exports.update = function(req, res) {
    Movie.findById(req.params.movie_id)
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((movie) => {
        if (req.body.name) movie.name = req.body.name;
        if (req.body.overview) movie.overview = req.body.overview;
        if (req.body.release_date) movie.release_date = req.body.release_date;
        if (req.body._directors) movie._directors = req.body._directors;
        if (req.body._actors) movie._actors = req.body._actors;
        if (req.body.imdb_id) movie.imdb_id = req.body.imdb_id;
        if (req.body.genres) movie.genres = req.body.genres;
        if (req.body.images) movie.images = req.body.images;
        if (req.body.isBoxOffice) movie.isBoxOffice = req.body.isBoxOffice;

        movie.save()
        .catch((err) => {
            res.status(RequestStatus.BAD_REQUEST).send(err);
        })
        .then((updatedMovie) => {
            res.status(RequestStatus.OK).json(updatedMovie);
        });
    });
};

exports.delete = function(req, res) {
    try {
        DataStoreUtils.deleteMediaById(req.params.movie_id);
        res.status(RequestStatus.OK).send('Movie removed.');
    } catch (err) {
        console.log(err);
        res.status(RequestStatus.BAD_REQUEST).send(err);
    }
};
