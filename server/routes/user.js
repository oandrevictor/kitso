var express = require('express');
var router = express.Router();

var passport = require('passport');
var authController = require('../controllers/authController');
var userController = require('../controllers/userController');

router.get('/', userController.index);

router.get('/status', authController.status);

router.get('/logout', authController.logout);

router.get('/:user_id', userController.show);

router.post('/signup', userController.create);

router.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), authController.login);

router.put('/:user_id', userController.update);

router.delete('/:user_id', userController.delete);

module.exports = router;
