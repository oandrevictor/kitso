// Imports gerais
var express = require('express');
var router = express.Router();

// Imports especificos, nao precisa desses comentarios, soh de pular uma linha entre os dois
var exampleController = require('../controllers/exampleController');

router.get('/', exampleController.index);

router.get('/:example_id', exampleController.show);

router.post('/', exampleController.create);

router.put('/:example_id', exampleController.update);

router.delete('/:example_id', exampleController.delete);

module.exports = router;