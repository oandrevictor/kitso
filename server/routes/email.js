var express = require('express');
var router = express.Router();

var emailController = require('../controllers/emailController');

router.post('/passwordRecover', emailController.sendPasswordRecoverEmail);

module.exports = router;
