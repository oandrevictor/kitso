var Media = require('../models/Media');
var RequestStatus = require('../constants/requestStatus');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');


// CRUD MEDIA =====================================================================================

exports.index = function(req, res) {
    Media.find({})
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((result) => {
        res.status(RequestStatus.OK).json(result);
    });
};

exports.show = async function(req, res) {
    try {
        let media = await Media.findById(req.params.media_id).exec();
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

        res.status(RequestStatus.OK).json(media);

    } catch (err) {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    }
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
            res.status(RequestStatus.OK).send(response);
        }
    } else {
        res.status(RequestStatus.BAD_REQUEST).json({message: "Body medias field is empty."});
    }
    
};

exports.create = function(req, res) {
    var media = new Media(req.body);

    media.save()
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((createdMedia) => {
        res.status(RequestStatus.OK).send(createdMedia);
    });
};

exports.update = function(req, res) {
    Media.findById(req.params.media_id)
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
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
            res.status(RequestStatus.BAD_REQUEST).send(err);
        })
        .then((updatedMedia) => {
            res.status(RequestStatus.OK).json(updatedMedia);
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


// AUXILIARY FUNCTIONS ============================================================================

// TODO: move to expert utils
var injectPersonJson = async function(personId) {
    let personObj = await DataStoreUtils.getPersonObjById(personId);
    return personObj;
};
