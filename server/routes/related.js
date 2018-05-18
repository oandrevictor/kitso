var express = require('express');
var router = express.Router();

var relatedController = require('../controllers/relatedController');

router.get('/', relatedController.index);

router.get('/:news_id', relatedController.show);

router.post('/', relatedController.create);

router.put('/:news_id', relatedController.update);

router.delete('/:news_id', relatedController.delete);

module.exports = router;
