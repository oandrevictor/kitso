var Media = require('../models/Media');
var Person = require('../models/Person');
var RequestStatus = require('../constants/requestStatus');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');

exports.index = function(req, res) {
    Media.find({})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        res.status(200).json(result);
    });
};

exports.show = async function(req, res) {
    Media.findById(req.params.media_id)
    .catch((err) => {        
        res.status(400).send(err);
    })
    .then( async (media) => {

        let directors = media._directors;
        let actors = media._actors;
        let directorsPromises = directors.map(injectPersonJson);
        let actorsPromises = actors.map(injectPersonJson);
        
        await Promise.all(directorsPromises).then(function(results) {            
            media._directors = results;
        });
        await Promise.all(actorsPromises).then(function(results) {
            media._actors = results;
        });

        res.status(200).json(media);
    });
};

exports.showAll = function(req, res) {
    var medias = req.body.medias;
    var queries = 0;
    var response = [];

    if (req.body.medias.length > 0) {
        for (var i = 0; i < medias.length; i++) {
            let cb_index = i;
            Media.findById(medias[i])
            .catch((err) => {
                response[cb_index] = {error: err};
                queries++;      
    
                if (queries == medias.length) done();
            })
            .then((result) => {
                response[cb_index] = {media: result};
                queries++;
    
                if (queries == medias.length) done();
            });
        }
    
        function done() {
            res.status(200).send(response);
        }
    } else {
        res.status(400).json({message: "Body medias field is empty."});
    }
    
};

exports.create = function(req, res) {
    var media = new Media(req.body);

    media.save()
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((createdMedia) => {
        res.status(200).send(createdMedia);
    });
};

exports.update = function(req, res) {
    Media.findById(req.params.media_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((media) => {
        if (req.body.name) media.name = req.body.name;
        if (req.body.overview) media.overview = req.body.overview;
        if (req.body.release_date) media.release_date = req.body.release_date;
        if (req.body._directors) media._directors = req.body._directors;
        if (req.body._actors) media._actors = req.body._actors;
        if (req.body.imdb_id) media.imdb_id = req.body.imdb_id;
        if (req.body.genres) media.genres = req.body.genres;
        if (req.body.images) media.images = req.body.images;


        media.save()
        .catch((err) => {
            res.status(400).send(err);
        })
        .then((updatedMedia) => {
            res.status(200).json(updatedMedia);
        });
    });
};

exports.delete = async function(req, res) {
    try {
        DataStoreUtils.deleteMediaById(req.params.media_id);
        res.status(RequestStatus.OK).send('Media removed.');
    } catch (err) {
        console.log(err);
        res.status(RequestStatus.BAD_REQUEST).send(err);
    }
};

var injectPersonJson = async function(personId) {
    let personObj = await getPersonObj(personId);
    return personObj;
}

var getPersonObj = async function(personId) {
    return Person.findById(personId).exec();
}
