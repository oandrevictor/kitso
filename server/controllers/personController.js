var Person = require('../models/Person');
var Media = require('../models/Media');
var redis = require('redis');
var client = redis.createClient();
const https = require('https');

exports.index = function(req, res) {
    Person.find({})
    .catch((err) => {
        res.status(400).send(err);
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

                  if (index == result.length -1) res.status(200).send(final_result);
                  }
                });
            } else {
              getPersonFromTMDB(tmdb_id).then(async function(data) {
                data = JSON.parse(data);
                data.profile_path = "https://image.tmdb.org/t/p/w500/" + data.profile_path;
                data._id = person._id;
                final_result.push(data);
                if (index == result.length -1) res.status(200).send(final_result);
              });
            }
          });
    });
  })
}

exports.show = function(req, res) {
    Person.findById(req.params.person_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
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
              parsed_result.profile_path = "https://image.tmdb.org/t/p/w500/" + parsed_result.profile_path;
              res.status(200).send(parsed_result);
              }
            });
        } else {
          getPersonFromTMDB(tmdb_id).then(async function(data) {
            data = JSON.parse(data);
            data._id = result._id;
            data.profile_path = "https://image.tmdb.org/t/p/w500/" + data.profile_path;
            res.status(200).send(data);
          });
        }
    });
  })
}

exports.create = async function(req, res) {
    var person = new Person(req.body);
    try {
        await add_person_to_media_cast(person._appears_in, person._id);
    } catch (err) {
        res.status(400).send(err);
    }

    person.save()
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((createdPerson) => {
        var res_json = {
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

        try {
            await add_person_to_media_cast(person._appears_in, person._id);
        } catch (err) {
            res.status(400).send(err);
        }

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

var add_person_to_media_cast = async function(medias, person_id) {
    medias.forEach(media_id => {
        Media.findById(media_id, function(err, media) {
            media._actors.push(person_id);
            media.save();
        });
    });
}

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
