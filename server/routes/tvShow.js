// Imports gerais
var express = require('express');
var router = express.Router();

// Imports especificos, nao precisa desses comentarios, soh de pular uma linha entre os dois
var tvShowController = require('../controllers/tvShowController');
var seasonController = require('../controllers/seasonController');
var episodeController = require('../controllers/episodeController');

router.get('/', tvShowController.index);

router.get('/:show_id', tvShowController.show);

router.get('/:show_id/season/:season_num', seasonController.show);

router.get('/:show_id/season/:season_num/episode/:episode_num', episodeController.show);

router.post('/', tvShowController.create);

router.put('/:show_id', tvShowController.update);

router.delete('/:show_id', tvShowController.delete);

module.exports = router;
