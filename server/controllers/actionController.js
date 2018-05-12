var Action = require('../models/Action');

// Todos as ações
exports.index = function(req, res) {
    Action.find({})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        res.status(200).json(result);
    });
};

// Todos as ações de um usuário
exports.byUser = function(req, res) {
    Action.find({ _user: req.param.user })
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        res.status(200).json(result);
    });
};

// Uma ação
exports.show = function(req, res) {
    Action.findById(req.params.action_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        res.status(200).json(result);
    });
};

// Criar ação
exports.create = function(req, res) {
    var action = new Action(req.body);

    action.save()
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((createdAction) => {
        res.status(200).send('Ação criada.');
    });
};

// Editar ação
exports.update = function(req, res) {
    Action.findById(req.params.action_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((action) => {
        action.nome = req.body.nome;
        
        action.save()
        .catch((err) => {
            res.status(400).send(err);
        })
        .then((updateAction) => {
            res.status(200).json(updateAction);
        });
    });
};

// Deletar ação
exports.delete = function(req, res) {
    Action.remove({ _id: req.params.action_id})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then(() => {
        res.status(200).send('Ação removida.');
    });
};