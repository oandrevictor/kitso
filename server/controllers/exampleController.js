var Example = require('../models/Example');

// Todos exemplos
exports.index = function(req, res) {
    Example.find({})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        res.status(200).json(result);
    });

    /* Ou...
    Example.find({}, function (err, result) {
        if (err) {
            res.status(400).send(err);
        } else {
            res.status(200).json(result);
        }
    });
    */
};

// Um exemplo
exports.show = function(req, res) {
    Example.findById(req.params.example_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        res.status(200).json(result);
    });
};

// Criar exemplo
exports.create = function(req, res) {
    var example = new Example(req.body);

    example.save()
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((createdExample) => {
        res.status(200).send('Examplo criado.');
    });
};

// Editar exemplo
exports.update = function(req, res) {
    Example.findById(req.params.example_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((example) => {
        example.nome = req.body.nome;
        
        example.save()
        .catch((err) => {
            res.status(400).send(err);
        })
        .then((updateExample) => {
            res.status(200).json(updateExample);
        });
    });
};

// Deletar exemplo
exports.delete = function(req, res) {
    Example.remove({ _id: req.params.example_id})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then(() => {
        res.status(200).send('Example removido.');
    });
};