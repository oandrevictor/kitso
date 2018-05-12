// Imports gerais
var express = require('express');
var router = express.Router();

// Imports especificos, nao precisa desses comentarios, soh de pular uma linha entre os dois
var moviesController = require('../controllers/moviesController');

router.get('/', moviesController.index);

router.get('/:movie_id', moviesController.show);

router.post('/', moviesController.create);

router.put('/:movie_id', moviesController.update);

router.delete('/:movie_id', moviesController.delete);

module.exports = router;
