var Person = require('../models/Person');
var AppearsIn = require('../models/AppearsIn');
var RequestStatus = require('../constants/requestStatus');
var Utils = require('../utils/lib/utils');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');

exports.index = function(req, res) {
    Person.find({})
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((result) => {
        res.status(RequestStatus.OK).json(result);
    });
};

exports.show = async function(req, res) {
    Person.findById(req.params.person_id)
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then(async (person) => {

        let appearsIn = person._appears_in;
        let appearsInPromises = appearsIn.map(DataStoreUtils.getAppearsInObjById);        
        await Promise.all(appearsInPromises).then(function(results) {            
            appearsIn = results;
        });
        
        let appearsInWithNestedMedia;
        let appearsInWithNestedMediaPromises = appearsIn.map(injectMediaJson);
        await Promise.all(appearsInWithNestedMediaPromises).then(function(results) {            
            appearsInWithNestedMedia = results;
        });

        person._appears_in = appearsInWithNestedMedia;
        res.status(RequestStatus.OK).json(person);
    });
};

exports.create = async function(req, res) {
    var person = new Person(req.body);
    person.save()
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((createdPerson) => {
        res_json = {
            "message": "Person created",
            "data": {
                "personId": createdPerson._id,
            }            
        }
        res.status(RequestStatus.OK).json(res_json);
    });
};

exports.update = function(req, res) {
    Person.findById(req.params.person_id)
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then(async(person) => {
        if (req.body.name) person.name = req.body.name;
        if (req.body.description) person.description = req.body.description;
        if (req.body.birthday) person.birthday = req.body.birthday;
        if (req.body.image_url) person.image_url = req.body.image_url;
        if (req.body._appears_in) person._appears_in = req.body._appears_in;

        person.save()
        .catch((err) => {
            res.status(RequestStatus.BAD_REQUEST).send(err);
        })
        .then((updatePerson) => {
            res.status(RequestStatus.OK).json(updatePerson);
        });
    });
};

exports.delete = function(req, res) {
    Person.findById(req.params.person_id)
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then(async (person) => {
        
        let personId = person._id;
        let appearsIns = person._appears_in;
        let appearsInPromises = appearsIns.map(DataStoreUtils.getAppearsInObjById);        
        await Promise.all(appearsInPromises).then(function(results) {            
            appearsIns = results;
        });
        
        let medias;
        let mediasPromises = appearsIns.map(getMediaObjFromAppearsInObj);
        await Promise.all(mediasPromises).then(function(results) {            
            medias = results;
        });

        // deleting person from medias' casts
        await medias.forEach(async (media) => {
            Utils.removeItemFromList(personId, media._actors);
            media.save();
        });
        
        // deleting appearsIns entities when delete person entity
        await appearsIns.forEach(async (appearsInId) => {
            await AppearsIn.remove({_id: appearsInId}).exec();
        });

        person.remove();
        res.status(RequestStatus.OK).send('Person removed.');
    });
};

var injectMediaJson = async function(appearsInObj) {
    let mediaId = appearsInObj._media;
    appearsInObj._media = await DataStoreUtils.getMediaObjById(mediaId);
    return appearsInObj;
}

var getMediaObjFromAppearsInObj = async function(appearsInObj) {
    let mediaId = appearsInObj._media;
    return await DataStoreUtils.getMediaObjById(mediaId);
}
