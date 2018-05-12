var passport = require('passport');
var _        = require('underscore');

exports.login = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({ err: info });
    }

    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({ err: 'Could not log in user' });
      }

      res.status(200).json({ status: 'Login successful!' });

    });
  })(req, res, next);
}

exports.logout = function(req, res) {
  req.logout();
  res.status(200).send('Logged out!')
}

exports.status = function(req, res) {
  var user = req.user;
	if (user) {
    user = _.omit(user.toJSON(), 'password');
		res.status(200).send({user: user, status: true});
	} else {
		res.status(200).send({status: false});
	}
}