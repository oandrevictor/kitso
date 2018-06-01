var Show = require('../models/TvShow');
var Season = require('../models/Season');
var Person = require('../models/Person');
var Episode = require('../models/Episode');
var AppearsIn = require('../models/AppearsIn');
var redis = require('redis');
const https = require('https');
var RequestStatus = require('../constants/requestStatus');
var RequestMsg = require('../constants/requestMsg');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');
var client = redis.createClient(19990, 'redis-19990.c16.us-east-1-2.ec2.cloud.redislabs.com', {no_ready_check: true});
client.auth('nsXmMM8VvJ7PrbYc4q6WZ50ilryBdbmM', function (err) {
    if (err) throw err;
});

// Todas as séries
exports.index = function(req, res) {
    Show.find({})
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((tv_result) => {
      var final_result = [];
      var answered = 0;
      tv_result.forEach((tvshow, index)=>{
        var tmdb_id = tvshow._tmdb_id;
        var query = 'tvshow/' + tmdb_id;
        client.exists(query, function(err, reply) {
          if (reply === 1) {

            client.get(query, async function(err,data) {
              if(err)
                console.log(err)
              else{
                console.log('got query from redis: tvshow/' + tmdb_id);
                answered +=1;
                var parsed_result = JSON.parse(JSON.parse(data));
                var promises = await tvshow._seasons.map(inject_seasons);
                parsed_result.poster_path = "https://image.tmdb.org/t/p/w500/" + parsed_result.poster_path;
                parsed_result._id = tvshow._id;
                parsed_result.__t = tvshow.__t;
                parsed_result.backdrop_path = "https://image.tmdb.org/t/p/original/" + parsed_result.backdrop_path;
                final_result.push(parsed_result);
                if (final_result.length == tv_result.length) {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(RequestStatus.OK).send(final_result);
                }
                }
              });
          } else {
            getShowFromTMDB(tmdb_id).then(async function(data) {
              answered += 1;
              console.log("Got from TMDB: " + tmdb_id )
              var promises = await tvshow._seasons.map(inject_seasons);
              data._id = tv_result._id;
              data.__t = tv_result.__t;
              final_result.push(data)
              if (final_result.length == tv_result.length) {
                res.setHeader('Content-Type', 'application/json');
                res.status(RequestStatus.OK).send(final_result);
              }
            })
          }
        });
      })
    });
};

exports.show = function(req, res) {
    Show.findById(req.params.show_id)
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((result) => {
      var tmdb_id = result._tmdb_id;
      var query = 'tvshow/' + tmdb_id
      client.exists('tvshow/' + tmdb_id, function(err, reply) {
        if (reply === 1) {
            client.get(query, async function(err,data) {
                if(err)
                  console.log(err)
                else{
                  var parsed_result = JSON.parse(JSON.parse(data));
                  promises = await result._seasons.map(inject_seasons);
                  var actors = result._actors;
                  let actorsPromises = actors.map(injectPersonJson);

                  Promise.all(promises).then(async function(results) {
                    parsed_result._seasons = results;
                    parsed_result.poster_path = "https://image.tmdb.org/t/p/w500/" + parsed_result.poster_path;
                    parsed_result._id = result._id;
                    parsed_result.__t = result.__t;
                    await Promise.all(actorsPromises).then(function(nested_actors) {
                      parsed_result._actors = nested_actors;
                      parsed_result.backdrop_path = "https://image.tmdb.org/t/p/original/" + parsed_result.backdrop_path;
                      res.setHeader('Content-Type', 'application/json');
                      res.status(RequestStatus.OK).send(parsed_result);
                    });

                  })
                }
              });
        } else {
          getShowFromTMDB(tmdb_id).then(async function(data) {
            var data = JSON.parse(data)
            var promises = await result._seasons.map(inject_seasons);

            Promise.all(promises).then(function(results) {
              data._seasons = results;
              data._id = result._id;
              data.__t = result.__t;
              res.status(RequestStatus.OK).send(data);
            })
          })
        }
      });
    });
};

exports.create = function(req, res) {
    var show = new Show(req.body);

    show.save()
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((createdShow) => {
      getShowFromTMDB(createdShow._tmdb_id).then( async (result)=> {
        result._id = createdShow._id;
        result._seasons = createdShow._seasons;
        result.__t = createdShow.__t;
        setTimeout(function(){matchApiSeasonsToDb(result, createdShow);}, 5000);
        result._actors = await matchApiCastToDb(createdShow);
        res.setHeader('Content-Type', 'application/json');
        res.status(RequestStatus.OK).send(result);
      })
    });
};

exports.update = function(req, res) {
    Show.findById(req.params.show_id)
    .catch((err) => {
        res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((show) => {
        if (req.body.name) show.name = req.body.name;
        if (req.body.overview) show.overview = req.body.overview;
        if (req.body.release_date) show.release_date = req.body.release_date;
        if (req.body._directors) show._directors = req.body._directors;
        if (req.body._actors) show._actors = req.body._actors;
        if (req.body.imdb_id) show.imdb_id = req.body.imdb_id;
        if (req.body.genres) show.genres = req.body.genres;
        if (req.body.images) show.images = req.body.images;
        if (req.body.seasons) show.seasons = req.body.seasons;


        show.save()
        .catch((err) => {
            res.status(RequestStatus.BAD_REQUEST).send(err);
        })
        .then((updatedShow) => {
            res.status(RequestStatus.OK).json(updatedShow);
        });
    });
};

// Deletar série
exports.delete = async function(req, res) {
    try {
        DataStoreUtils.deleteMediaById(req.params.show_id);
        res.status(RequestStatus.OK).send('Show removed.');
    } catch (err) {
        console.log(err);
        res.status(RequestStatus.BAD_REQUEST).send(err);
    }
};

getShowFromTMDB = function(tmdb_id) {
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

getSeasonFromAPI = function(tv_id, season_number){
  return new Promise(function(resolve, reject) {
    var query = 'tvshow/' + tv_id + '/season/' + season_number
    https.get("https://api.themoviedb.org/3/tv/"+ tv_id + "/season/"+ season_number +"?api_key=db00a671b1c278cd4fa362827dd02620",
    (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        console.log("saving season result to redis:"+  query)
        client.set(query, JSON.stringify(data));
        resolve(data)
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
      reject();
    });
  })
}

matchApiSeasonsToDb = function(tvshow, dbtvshow){
  var tvshow = JSON.parse(tvshow);
  tvshow.seasons.forEach(function(season){
    //before create fetch from db
    var tmdb_id = season.id;
    var name = season.name;
    var db_season = new Season();
    db_season.name = name;
    db_season._tmdb_id = tmdb_id;
    db_season.imdb_id = "";
    db_season.number = season.season_number;
    db_season._tvshow_id = dbtvshow._id;

    db_season.save().then((created) =>{
      matchApiEpisodesToDb(tvshow, season, created);
      dbtvshow._seasons.push(created._id);
      dbtvshow.save().then((tvshow)=>{
      }).catch((err)=>{
        console.log(err)
      })
    }).catch((err)=>{
      console.log(err);
    })
  })
}

getCastFromAPI = function(tv_id){
  return new Promise(function(resolve, reject) {
    console.log(tv_id)
    https.get("https://api.themoviedb.org/3/tv/"+ tv_id + "/credits"+"?api_key=db00a671b1c278cd4fa362827dd02620",
    (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        resolve(data)
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
      reject();
    });
  })
}

matchApiCastToDb = async function(dbtvshow){
  getCastFromAPI(dbtvshow._tmdb_id).then(function(credits){
    var credits = JSON.parse(credits)
    var cast = credits.cast;
    var castSize = cast.length;
    var nCast = 0;
    var castIds = [];

    cast.forEach(function(person, i){
      var tmdb_id = person.id;
      var name = person.name;
      var character = person.character;
      var picture = person.profile_path;
      var description = "No description yet";
      var db_person = new Person();
      db_person.name = name;
      db_person._tmdb_id = tmdb_id;
      db_person.image_url = picture;
      db_person.description = description;
      db_person.save().then(async (created_db_person)=>{
        nCast++;
        castIds[i] = created_db_person._id;
        await createAppearsIn(created_db_person._id, dbtvshow._id);
        if (nCast == castSize) done();
      }).catch((err)=>{console.log(err)});
    });

    function done() {
      return castIds;
    }

  });
}

matchApiEpisodesToDb = function(tvshow, seasonapi, dbseason){

  getSeasonFromAPI(tvshow.id, seasonapi.season_number).then((season)=>{
    var season = JSON.parse(season);
    season.episodes.forEach(function(episode){
      //before create fetch from db
      var tmdb_id = episode.id;
      var name = episode.name;
      var db_episode = new Episode();
      db_episode._tvshow_id = dbseason._tvshow_id;
      db_episode._season_id = dbseason._id;
      db_episode._tmdb_tvshow_id = tvshow.id;
      db_episode.season_number= season.season_number
      db_episode.name = name;
      db_episode._tmdb_id = tmdb_id;
      db_episode.number = episode.episode_number;
      db_episode.save().then((created) =>{
        console.log('Created Ep: '+ created.name)
        dbseason._episodes.push(created._id);
        dbseason.save().then((saved_season)=>{
        }).catch((err)=>{
          console.log(err)
        })
      }).catch((err)=>{
        console.log(err);
      });
    });
  });
}

createAppearsIn = async function(personId, mediaId) {
  try {
    let appearsIn = new AppearsIn();
    appearsIn._media = mediaId;
    appearsIn._person = personId;
    let appearsInId = appearsIn._id;

    let isDuplicated = await alreadyExists(personId, mediaId);
    if (isDuplicated) {
        console.log(RequestMsg.DUPLICATED_ENTITY);
    } else {
        await saveAppearsIn(appearsIn);
        await DataStoreUtils.addAppearsInToPerson(personId, appearsInId);
        await addPersonToMediaCast(personId, mediaId);
        res_json = {
            "message": "AppearsIn created",
            "data": {
                "appearsInId": appearsInId,
            }            
        }
        console.log(res_json);
    }
  } catch (err) {
    console.log(err);
  } 
}

var saveAppearsIn = function(appearsIn) {
  return appearsIn.save();
}

var addPersonToMediaCast = function(personId, mediaId) {
  Show.findById(mediaId, function (err, show) {
      if (!show._actors.includes(personId)) {
        show._actors.push(personId);
      }
      return show.save();
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

// TODO: move to expert utils
var injectPersonJson = async function(personId) {
    let personObj = await DataStoreUtils.getPersonObjById(personId);
    return personObj;
};

inject_seasons = function(season) {
  return Season.findById(season).exec();
}