var User   = require('../models/User');
var bcrypt = require('bcryptjs');
var _      = require('underscore');

// Todos usuários
exports.index = function(req, res) {
    User.find({})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        res.status(200).json(result);
    });
};

// Um usuário
exports.show = function(req, res) {
    User.findById(req.params.user_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        res.status(200).json(result);
    });
};

exports.findByEmail = function (req, res) {
    User.findOne({email: req.body.email})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        if (result) res.status(200).json(result);
        else res.status(400).json('User not found.');
    });
}

// Criar usuário
exports.create = function(req, res) {
    var user = new User(req.body);

    bcrypt.hash(req.body.password, 10, function(err, hash) {
        if (err) {
            res.status(400).send(err);
        } else {
          user.password = hash;
          user.save(function(err) {
            if (err) {
              if (err.name === 'MongoError' && err.code === 11000) {
                return res.status(403).send(err);
              }
            } else {
              res.status(200).send('User created.');
            }
          });
        }
    });
};

// Editar usuário
exports.update = function(req, res) {
    User.findById(req.params.user_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((user) => {
        if (req.body.name) user.name = req.body.name;
        if (req.body.username) user.username = req.body.username;
        if (req.body.email) user.email = req.body.email;
        if (req.body.birthday) user.birthday = req.body.birthday;
        if (req.body.gender) user.gender = req.body.gender;
        if (req.body.description) user.description = req.body.description;
        if (req.body._history) user._history = req.body._history;
        if (req.body._following) user._following = req.body._following;
        if (req.body._following_pages) user._following_pages = req.body._following_pages;
        if (req.body._followers) user._followers = req.body._followers;
        if (req.body.vip) user.vip = req.body.vip;
        if (req.body._watchlist) user._watchlist = req.body._watchlist;
        if (req.body._lists) user._lists = req.body._lists;
        if (req.body._ratings) user._ratings = req.body._ratings;

        if (req.body.new_password) {
            bcrypt.hash(req.body.new_password, 10, function(err, hash) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    user.new_password = hash;
                    user.save(function(err) {
                        if (err) {
                            if (err.name === 'MongoError' && err.code === 11000) {
                                return res.status(403).send(err);
                            }
                        } else {
                            return res.status(200).send('User updated.');
                        }
                    });
                }
            });
        } else {
            user.save(function(err) {
                if (err) { 
                    return res.status(403).send(err);
                } else {
                    return res.status(200).send('User updated.');
                }
            });
        }
    });
};

exports.updatePassword = function(req, res) {
    User.findOne({ email: req.params.email})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((user) => {
        if (user.new_password) {
            user.password = user.new_password;
            user.new_password = null;

            user.save(function(err) {
                if (err) { 
                    return res.status(403).send(err);
                } else {
                    return res.status(200).send('Password updated!!');
                }
            });
        }
    });
};

// Deletar usuário
exports.delete = function(req, res) {
    User.findById(req.params.user_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((user) => {
        if (user.validPassword(req.body.password)) {
            User.remove({ _id: req.params.user_id})
            .catch((err) => {
                res.status(400).send({status: 400, message: err});
            })
            .then(() => {
                req.logout();
                res.status(200).send('User removed.');
            });
        } else {
            return res.status(401).json({status: 401, message: 'Wrong password'});
        }
    });
};
