var Person = require('../models/Person');
var AppearsIn = require('../models/AppearsIn');
var Person = require('../models/Person');
var RequestStatus = require('../constants/requestStatus');
var Utils = require('../utils/lib/utils');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');

var RedisClient = require('../utils/lib/redisClient');
var TMDBController = require('../external/TMDBController');
const https = require('https');
const redisClient = RedisClient.createAndAuthClient();


// CRUD PERSON ====================================================================================

exports.index = function(req, res) {
  Person.find({})
  .catch((err) => {
    res.status(RequestStatus.BAD_REQUEST).send(err);
  })
  .then((result) => {
    var waiting_time = [500];
    var total_waiting = 500;
    var final_result = [];
    result.forEach((person, index)=> {
      waiting_time.push(total_waiting + 500);
      var tmdb_id = person._tmdb_id;
      var query = 'person/' + tmdb_id;
      redisClient.exists(query, function(err, reply) {
        if (reply === 1) {
          redisClient.get(query, async function(err,data) {
            if(err)
            console.log(err)
            else{
              console.log('got query from redis: ' + query);
              var parsed_result = JSON.parse(data);
              parsed_result._id = person._id;
              final_result.push(parsed_result);

              if (index == result.length -1) res.status(RequestStatus.OK).send(final_result);
            }
          });
        } else {
          total_waiting += 500;
          setTimeout(function() {
            TMDBController.getPersonFromTMDB(tmdb_id).then(async function(data) {
              data = JSON.parse(data);
              data.profile_path = "https://image.tmdb.org/t/p/w500/" + data.profile_path;
              data._id = person._id;
              final_result.push(data);
              redisClient.set(query, JSON.stringify(data));
              if (index == result.length -1) res.status(RequestStatus.OK).send(final_result);
            })}, waiting_time[index]);
          }
        });
      });
    })
  };

  exports.show = async function(req, res) {
    Person.findById(req.params.person_id)
    .catch((err) => {
      res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then(async (result) => {
      let appearsIn = result._appears_in;
      let appearsInPromises = appearsIn.map(DataStoreUtils.getAppearsInObjById);
      await Promise.all(appearsInPromises).then(function(results) {
        appearsIn = results;
      });

      let appearsInWithNestedMedia;
      let appearsInWithNestedMediaPromises = appearsIn.map(injectMediaJsonInAppearsIn);
      await Promise.all(appearsInWithNestedMediaPromises).then(function(results) {
        appearsInWithNestedMedia = results;
      });

      result._appears_in = appearsInWithNestedMedia;


      var tmdb_id = result._tmdb_id;
      var query = 'person/show/' + tmdb_id;
      redisClient.exists(query, function(err, reply) {
        if (reply === 1) {
          redisClient.get(query, async function(err,data) {
            if(err)
            console.log(err)
            else{
              console.log('got query from redis: ' + query);
              var parsed_result = JSON.parse(data);
              parsed_result._id = result._id;
              parsed_result.helper = result.helper;
              parsed_result._appears_in = result._appears_in;
              res.status(RequestStatus.OK).send(parsed_result);
            }
          });
        } else {
          TMDBController.getPersonFromTMDB(tmdb_id).then(async function(data) {
            data = JSON.parse(data);
            data._id = result._id;
            data.helper = result.helper;
            data._appears_in = result._appears_in;
            data.profile_path = "https://image.tmdb.org/t/p/w500/" + data.profile_path;
            redisClient.set(query, JSON.stringify(data));
            res.status(RequestStatus.OK).send(data);
          });
        }
      });
    })
  };

  exports.create = async function(req, res) {
    var person = new Person(req.body);
    person.save()
    .catch((err) => {
      res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((createdPerson) => {
      var res_json = {
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

      // TODO: delete followpages refs to this person

      person.remove();
      res.status(RequestStatus.OK).send('Person removed.');
    });
  };


  // AUXILIARY FUNCTIONS ============================================================================

  var injectMediaJsonInAppearsIn = async function(appearsInObj) {
    let mediaId = appearsInObj._media;
    appearsInObj._media = await DataStoreUtils.getMediaObjById(mediaId);
    if(appearsInObj._media.__t == "TvShow"){
      appearsInObj._media.helper = await TMDBController.getShow(appearsInObj._media._tmdb_id).then(function (show){
        return JSON.stringify(show);
      });
    }
    else {
      appearsInObj._media.helper = await TMDBController.getMovie(appearsInObj._media._tmdb_id).then(function (movie){
        return JSON.stringify(movie);
      });
    }

    return appearsInObj;
  };

  var getMediaObjFromAppearsInObj = async function(appearsInObj) {
    let mediaId = appearsInObj._media;
    return await DataStoreUtils.getMediaObjById(mediaId);
  };
