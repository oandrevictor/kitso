// Imports gerais
var express = require('express');
var router = express.Router();

// Imports especificos, nao precisa desses comentarios, soh de pular uma linha entre os dois
var mediaController = require('../controllers/mediaController');

router.get('/', mediaController.index);

router.get('/:media_id', mediaController.media);

router.post('/', mediaController.create);

router.put('/:media_id', mediaController.update);

router.delete('/:media_id', mediaController.delete);

module.exports = router;
