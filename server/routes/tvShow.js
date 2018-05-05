// Imports gerais
var express = require('express');
var router = express.Router();

// Imports especificos, nao precisa desses comentarios, soh de pular uma linha entre os dois
var tvShowController = require('../controllers/tvShowController');

router.get('/', tvShowController.index);

router.get('/:show_id', tvShowController.show);

router.post('/', tvShowController.create);

router.put('/:show_id', tvShowController.update);

router.delete('/:show_id', tvShowController.delete);

module.exports = router;
