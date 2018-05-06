var Movie = require('../models/Movie');

// Todos filmes
exports.index = function(req, res) {
    Movie.find({})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        res.status(200).json(result);
    });
};

// Um filme
exports.show = function(req, res) {
    Movie.findById(req.params.movie_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        res.status(200).json(result);
    });
};

// Criar filme
exports.create = function(req, res) {
    var movie = new Movie(req.body);

    movie.save()
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((createdMovie) => {
        res_json = {
            "message": "Movie created.",
            "data": {
                "movieId": createdMovie._id,
            }            
        }        
        res.status(200).json(res_json);
    });
};

// Editar filme
exports.update = function(req, res) {
    Movie.findById(req.params.movie_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((movie) => {
        movie.nome = req.body.nome;

        movie.save()
        .catch((err) => {
            res.status(400).send(err);
        })
        .then((updatedMovie) => {
            res.status(200).json(updatedMovie);
        });
    });
};

// Deletar filme
exports.delete = function(req, res) {
    Movie.remove({ _id: req.params.movie_id})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then(() => {
        res.status(200).send('Movie removed.');
    });
};
