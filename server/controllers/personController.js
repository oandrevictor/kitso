var Person = require('../models/Person');
var Media = require('../models/Media');

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

exports.create = async function(req, res) {
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
        res.status(200).json(res_json);
    });
};

exports.update = function(req, res) {
    Person.findById(req.params.person_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then(async(person) => {
        if (req.body.name) person.name = req.body.name;
        if (req.body.description) person.description = req.body.description;
        if (req.body.birthday) person.birthday = req.body.birthday;
        if (req.body.image_url) person.image_url = req.body.image_url;
        if (req.body._appears_in) person._appears_in = req.body._appears_in;

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
    Person.findById(req.params.person_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((person) => {
        Person.remove({ _id: req.params.person_id})
        .catch((err) => {
            res.status(400).send(err);
        })
        .then(async () => {
            try {
                await remove_person_from_media_cast(person._appears_in, person._id);
                res.status(200).send('Person removed.');
            } catch (err) {
                res.status(400).send(err);
            }
        });
    });
};

var remove_person_from_media_cast = async function(medias, person_id) {
    medias.forEach(media_id => {
        Media.findById(media_id, function(err, media) {
            var index = media._actors.indexOf(person_id);
            if (index > -1) {
                media._actors.splice(index, 1);
            }
            media.save();
        });
    });
}
