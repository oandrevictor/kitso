var User = require('../models/User');

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

    user.save()
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((createdExample) => {
        res.status(200).send('User created.');
    });
};

// Editar usuário
exports.update = function(req, res) {
    User.findById(req.params.user_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((user) => {
        user.nome = req.body.nome;

        user.save()
        .catch((err) => {
            res.status(400).send(err);
        })
        .then((updateUser) => {
            res.status(200).json(updateUser);
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
