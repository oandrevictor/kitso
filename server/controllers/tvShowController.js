var Show = require('../models/TvShow');
var Season = require('../models/Season');
var Episode = require('../models/Episode');
var redis = require('redis');
var client = redis.createClient();
const https = require('https');



// Todas as séries
exports.index = function(req, res) {
    Show.find({})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
      final_result = [];
      result.forEach((tvshow, index)=>{
        var tmdb_id = tvshow._tmdb_id;
        var query = 'tvshow/' + tmdb_id;
        client.exists(query, function(err, reply) {
          if (reply === 1) {
            console.log('exists');
            client.get(query, async function(err,data) {
              if(err)
                console.log(err)
              else{
                console.log('got query from redis');
                var parsed_result = JSON.parse(JSON.parse(data));
                promises = await tvshow._seasons.map(inject_seasons);

                Promise.all(promises).then(function(results) {
                  parsed_result._seasons = results;
                  parsed_result.poster_path = "https://image.tmdb.org/t/p/w500/" + parsed_result.poster_path;
                  parsed_result._id = tvshow._id;
                  parsed_result.__t = tvshow.__t;
                  parsed_result.backdrop_path = "https://image.tmdb.org/t/p/w500/" + parsed_result.backdrop_path;
                  final_result.push(parsed_result);
                  if (index == result.length -1) res.status(200).send(final_result);
                  })
                }
              });
          } else {
            getShowFromTMDB(tmdb_id).then(async function(data) {
              promises = await tvshow._seasons.map(inject_seasons);

              Promise.all(promises).then(function(results) {
                data = JSON.parse(data);
                data._seasons = results;
                data._id = result._id;
                data.__t = result.__t;
                final_result.push(data)
                if (index == result.length -1) res.status(200).send(final_result);
              });
            })
          }
        });
      })
    });
};

inject_seasons = function(season) {
  return Season.findById(season).exec();
}

// Uma série
exports.show = function(req, res) {
    Show.findById(req.params.show_id)
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
      tmdb_id = result._tmdb_id;
      query = 'tvshow/' + tmdb_id
      client.exists('tvshow/' + tmdb_id, function(err, reply) {
        if (reply === 1) {
            console.log('exists');
            client.get(query, async function(err,data) {
                if(err)
                  console.log(err)
                else{
                  console.log('got query from redis');
                  var parsed_result = JSON.parse(JSON.parse(data));
                  promises = await result._seasons.map(inject_seasons);

                  Promise.all(promises).then(function(results) {
                    parsed_result._seasons = results;
                    parsed_result.poster_path = "https://image.tmdb.org/t/p/w500/" + parsed_result.poster_path;
                    parsed_result._id = result._id;
                    parsed_result.__t = result.__t;
                    parsed_result.backdrop_path = "https://image.tmdb.org/t/p/w500/" + parsed_result.backdrop_path;
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).send(parsed_result);
                  })
                }
              });
        } else {
          getShowFromTMDB(tmdb_id).then(async function(data) {
            data = JSON.parse(data)
            promises = await result._seasons.map(inject_seasons);

            Promise.all(promises).then(function(results) {
              data._seasons = results;
              data._id = result._id;
              data.__t = result.__t;
              res.status(200).send(data);
            })
          })
        }
      });
    });
};

// Criar série
exports.create = function(req, res) {
    var show = new Show(req.body);

    show.save()
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((createdShow) => {
      console.log(createdShow)
      getShowFromTMDB(createdShow._tmdb_id).then((result)=> {
        result._id = createdShow._id;
        result._seasons = createdShow._seasons;
        result.__t = createdShow.__t;
        matchApiSeasonsToDb(result, createdShow);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(result);
      })
    });
};

// Editar série
exports.update = function(req, res) {
    Show.findById(req.params.show_id)
    .catch((err) => {
        res.status(400).send(err);
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
            res.status(400).send(err);
        })
        .then((updatedShow) => {
            res.status(200).json(updatedShow);
        });
    });
};

// Deletar série
exports.delete = function(req, res) {
    Show.remove({ _id: req.params.show_id})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then(() => {
        res.status(200).send('Show removed.');
    });
};

getShowFromTMDB = function(tmdb_id){
  return new Promise(function(resolve, reject) {
    query = 'tvshow/' + tmdb_id
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
    var query = 'tvshow/' + tv_id + '/season' + season_number
    console.log("log")
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

matchApiEpisodesToDb = function(tvshow, seasonapi, dbseason){
  console.log(seasonapi.name)
  console.log(seasonapi.season_number)
  getSeasonFromAPI(tvshow.id, seasonapi.season_number).then((season)=>{
    var season = JSON.parse(season);
  console.log("THE SEASON")
  console.log(season.episodes.length)
    season.episodes.forEach(function(episode){
      //before create fetch from db
      var tmdb_id = episode.id;
      var name = episode.name;
      var db_episode = new Episode();
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
      })
    })
  })
}