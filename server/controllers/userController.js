var User   = require('../models/User');
var bcrypt = require('bcryptjs');

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

// Criar usuário
exports.create = function(req, res) {
    var user = new User(req.body);

    //user.password = user.generateHash(req.body.password);

    bcrypt.hash(req.body.password, 10, function(err, hash) {
        if (err) {
            res.status(400).send(err);
        } else {
          user.password = hash;
          user.save(function(err) {
            if (err) {
              if (err.name === 'MongoError' && err.code === 11000) {
                return res.status(400).send('User already exists.');
              }
              return res.status(400).send(err);
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
        if (req.body._history) user._history = req.body._history;
        if (req.body._following) user._following = req.body._following;
        if (req.body._following_pages) user._following_pages = req.body._following_pages;
        if (req.body._followers) user._followers = req.body._followers;
        if (req.body.vip) user.vip = req.body.vip;
        if (req.body._watchlist) user._watchlist = req.body._watchlist;
        if (req.body._lists) user._lists = req.body._lists;
        if (req.body._ratings) user._ratings = req.body._ratings;


        bcrypt.hash(req.body.password, 10, function(err, hash) {
            if (err) {
                res.status(400).send(err);
            } else {
              user.password = hash;
              user.save(function(err) {
                if (err) {
                  if (err.name === 'MongoError' && err.code === 11000) {
                    return res.status(400).send('User already exists.');
                  }
                  return res.status(400).send(err);
                } else {
                  res.status(200).send('User updated.');
                }
              });
            }
        });
    });
};

// Deletar usuário
exports.delete = function(req, res) {
    User.remove({ _id: req.params.user_id})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then(() => {
        res.status(200).send('User removed.');
    });
};
