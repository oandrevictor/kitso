var passport = require('passport');
var _        = require('underscore');
var RequestStatus = require('../constants/requestStatus');

exports.login = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(RequestStatus.UNAUTHORIZED).json({ err: info });
    }

    req.logIn(user, function(err) {
      if (err) {
        return res.status(RequestStatus.INTERNAL_SERVER_ERROR).json({ err: 'Could not log in user' });
      }

      res.status(RequestStatus.OK).json({ status: 'Login successful!' });

    });
  })(req, res, next);
}

exports.logout = function(req, res) {
  req.logout();
  res.status(RequestStatus.OK).send('Logged out!')
}

exports.status = function(req, res) {
  var user = req.user;
  if (user) {
    user = _.omit(user.toJSON(), 'password');
    user.image = Buffer.from(user.image.data).toString('base64');
    res.status(RequestStatus.OK).send({user: user, status: true});
  } else {
    res.status(RequestStatus.OK).send({status: false});
  }
}
