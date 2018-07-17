var express = require('express');
var router = express.Router();

var UpdateTvShowInfoController = require('../controllers/updateTvShowInfoController');

router.put('/', UpdateTvShowInfoController.update);

module.exports = router;
