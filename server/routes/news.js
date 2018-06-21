var express = require('express');
var router = express.Router();

var newController = require('../controllers/newsController');

router.get('/', newController.index);

router.post('/loadMetadata', newController.loadMetadata);

router.get('/:news_id', newController.show);

router.post('/', newController.create);

router.put('/:news_id', newController.update);

router.delete('/:news_id', newController.delete);

module.exports = router;
