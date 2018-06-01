var AppearsIn = require('../models/AppearsIn');
var Person = require('../models/Person');
var Media = require('../models/Media');
var RequestStatus = require('../constants/requestStatus');
var RequestMsg = require('../constants/requestMsg');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');

// CRUD APPEARSIN =================================================================================

exports.index = function(req, res) {
    AppearsIn.find({})
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((result) => {
        res.status(RequestStatus.OK).json(result);
    });
};

exports.show = function(req, res) {
    AppearsIn.findById(req.params.appearsin_id)
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((result) => {
        res.status(RequestStatus.OK).json(result);
    });
};

exports.create = async function(req, res) {
    try {
        let appearsIn = new AppearsIn(req.body);
        let appearsInId = appearsIn._id;
        let personId = appearsIn._person;
        let mediaId = appearsIn._media;

        let isDuplicated = await alreadyExists(personId, mediaId);
        if (isDuplicated) {
            res.status(RequestStatus.UNPROCESSABLE_ENTITY)
                .send(RequestMsg.DUPLICATED_ENTITY);
        } else {
            await saveAppearsIn(appearsIn);
            await addAppearsInToPerson(personId, appearsInId);
            await addPersonToMediaCast(personId, mediaId);
            res_json = {
                "message": "AppearsIn created",
                "data": {
                    "appearsInId": appearsInId,
                }            
            }
            res.status(RequestStatus.OK).json(res_json);
        }
    } catch (err) {
        console.log(err);
        res.status(RequestStatus.BAD_REQUEST).send(err);
    }    
};

exports.update = function(req, res) {
    AppearsIn.findById(req.params.appearsin_id)
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((appearsin) => {
        if (req.body._person) appearsin._person = req.body._person;
        if (req.body._media) appearsin._media = req.body._media;
        appearsin.save()
        .catch((err) => {
            res.status(RequestStatus.BAD_REQUEST).send(err);
        })
        .then((updateAppearsIn) => {
            res.status(RequestStatus.OK).json(updateAppearsIn);
        });
    });
};

exports.delete = function(req, res) {
    AppearsIn.remove({ _id: req.params.appearsin_id})
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then(() => {
        res.status(RequestStatus.OK).send('AppearsIn removed.');
    });
};


// AUXILIARY FUNCTIONS ============================================================================

var saveAppearsIn = function(appearsIn) {
    return appearsIn.save();
}

var addAppearsInToPerson = function(personId, appearsInId) {
    Person.findById(personId, function (err, person) {
        person._appears_in.push(appearsInId);
        return person.save();
    });      
}

var addPersonToMediaCast = function(personId, mediaId) {
    Media.findById(mediaId, function (err, media) {
        if (!media._actors.includes(personId)) {
            media._actors.push(personId);
        }
        return media.save();
    });
}

var alreadyExists = async function(personId, mediaId) {
    let isDuplicated = await AppearsIn.find({_person: personId, _media: mediaId}).exec();
    if (isDuplicated.length > 0) {
        return true;
    } else {
        return false;
    }
}