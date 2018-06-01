var Person = require('../models/Person');
var Media = require('../models/Media');
var redis = require('redis');
var redis = require('redis');
var client = redis.createClient(19990, 'redis-19990.c16.us-east-1-2.ec2.cloud.redislabs.com', {no_ready_check: true});
client.auth('nsXmMM8VvJ7PrbYc4q6WZ50ilryBdbmM', function (err) {
    if (err) throw err;
});
const https = require('https');
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
        var final_result = [];
        result.forEach((person, index)=> {
          var tmdb_id = person._tmdb_id;
          var query = 'person/' + tmdb_id;
          client.exists(query, function(err, reply) {
            if (reply === 1) {
              client.get(query, async function(err,data) {
                if(err)
                  console.log(err)
                else{
                  console.log('got query from redis');
                  var parsed_result = JSON.parse(JSON.parse(data));
                  parsed_result.profile_path = "https://image.tmdb.org/t/p/w500/" + parsed_result.profile_path;
                  parsed_result._id = person._id;
                  final_result.push(parsed_result);

                  if (index == result.length -1) res.status(RequestStatus.OK).send(final_result);
                  }
                });
            } else {
              setTimeout(function() {
                getPersonFromTMDB(tmdb_id).then(async function(data) {
                  data = JSON.parse(data);
                  data.profile_path = "https://image.tmdb.org/t/p/w500/" + data.profile_path;
                  data._id = person._id;
                  final_result.push(data);
                  if (index == result.length -1) res.status(RequestStatus.OK).send(final_result);
                })}, 500);
            }
          });
    });
  })
}

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
      let appearsInWithNestedMediaPromises = appearsIn.map(injectMediaJson);
      await Promise.all(appearsInWithNestedMediaPromises).then(function(results) {
          appearsInWithNestedMedia = results;
      });

      result._appears_in = appearsInWithNestedMedia;


      var tmdb_id = result._tmdb_id;
      var query = 'person/' + tmdb_id;
      client.exists(query, function(err, reply) {
        if (reply === 1) {
          client.get(query, async function(err,data) {
            if(err)
              console.log(err)
            else{
              console.log('got query from redis');
              var parsed_result = JSON.parse(JSON.parse(data));
              parsed_result._id = result._id;
              parsed_result.helper = result.helper;
              parsed_result._appears_in = result._appears_in;
              parsed_result.profile_path = "https://image.tmdb.org/t/p/w500/" + parsed_result.profile_path;
              res.status(RequestStatus.OK).send(parsed_result);
              }
            });
        } else {
          getPersonFromTMDB(tmdb_id).then(async function(data) {
            data = JSON.parse(data);
            data._id = result._id;
            data.profile_path = "https://image.tmdb.org/t/p/w500/" + data.profile_path;
            res.status(RequestStatus.OK).send(data);
          });
        }
    });
  })
}

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

        person.remove();
        res.status(RequestStatus.OK).send('Person removed.');
    });
};

var injectMediaJson = async function(appearsInObj) {
    let mediaId = appearsInObj._media;
    appearsInObj._media = await DataStoreUtils.getMediaObjById(mediaId);
    appearsInObj._media.helper = await getShow(appearsInObj._media._tmdb_id).then(function (show){
      return JSON.stringify(show);
    });
    return appearsInObj;
}

var getMediaObjFromAppearsInObj = async function(appearsInObj) {
    let mediaId = appearsInObj._media;
    return await DataStoreUtils.getMediaObjById(mediaId);
}

getPersonFromTMDB = function(tmdb_id){
  return new Promise(function(resolve, reject) {
    var query = 'person/' + tmdb_id
    console.log("Could not get from redis, requesting info from The Movie DB")
    https.get("https://api.themoviedb.org/3/person/"+ tmdb_id + "?api_key=db00a671b1c278cd4fa362827dd02620",
    (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        console.log("saving result to redis: "+ query)
        client.set(query, JSON.stringify(data));
        resolve(data)
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
      reject();
    });
  })
}


var getShow = function(tmdb_id){
  return new Promise(function(resolve, reject) {
    var query = 'tvshow/' + tmdb_id;
    client.exists('tvshow/' + tmdb_id, function(err, reply) {
      if (reply === 1) {
          console.log('exists');
          client.get(query, async function(err,data) {
              if(err)
                console.log(err)
              else{
                console.log('got query from redis');
                var parsed_result = JSON.parse(JSON.parse(data));
                  //parsed_result.poster_path = "https://image.tmdb.org/t/p/w500/" + parsed_result.poster_path;
                  parsed_result.backdrop_path = "https://image.tmdb.org/t/p/original/" + parsed_result.backdrop_path;
                  resolve(parsed_result);
              }
            });
      } else {
        getShowFromTMDB(tmdb_id).then(async function(data) {
          var data = JSON.parse(data)
            data._id = result._id;
            data.__t = result.__t;
            resolve(data);
        })
      }
})
})
}

var getShowFromTMDB = function(tmdb_id){
  return new Promise(function(resolve, reject) {
    var query = 'tvshow/' + tmdb_id
    console.log("Could not get from redis, requesting info from The Movie DB")
    https.get("https://api.themoviedb.org/3/tv/"+ tmdb_id + "?api_key=db00a671b1c278cd4fa362827dd02620",
    (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        console.log("saving result to redis: "+ query)
        client.set(query, JSON.stringify(data));
        resolve(data)
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
      reject();
    });
  })
}
