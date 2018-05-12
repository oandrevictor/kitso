// Imports gerais
var express = require('express');
var router = express.Router();

// Imports especificos, nao precisa desses comentarios, soh de pular uma linha entre os dois
var actionController = require('../controllers/actionController');

router.get('/', actionController.index);

router.get('/:action_id', actionController.show);

router.get('/query/fields', actionController.byUser);

router.post('/', actionController.create);

router.put('/:action_id', actionController.update);

router.delete('/:action_id', actionController.delete);

module.exports = router;