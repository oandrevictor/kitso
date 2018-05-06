var Person = require('../models/Person');

exports.index = function(req, res) {
    Person.find({})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        res.status(200).json(result);
    });
};

exports.show = function(req, res) {
    Person.findById(req.params.person_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        res.status(200).json(result);
    });
};

exports.create = function(req, res) {
    var person = new Person(req.body);

    person.save()
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((createdPerson) => {
        res_json = {
            "message": "Person created",
            "data": {
                "personId": createdPerson._id,
            }            
        }
        res.status(200).send(res_json);
    });
};

exports.update = function(req, res) {
    Person.findById(req.params.person_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((person) => {
        person.name = req.body.name;
        person.description = req.body.description;
        person.birthday = req.body.birthday;
        person._appears_in = req.body._appears_in;
        person.save()
        .catch((err) => {
            res.status(400).send(err);
        })
        .then((updatePerson) => {
            res.status(200).json(updatePerson);
        });
    });
};

exports.delete = function(req, res) {
    Person.remove({ _id: req.params.person_id})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then(() => {
        res.status(200).send('Person removed.');
    });
};
