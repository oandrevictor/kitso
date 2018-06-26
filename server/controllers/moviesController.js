var Movie = require('../models/Movie');
var Media = require('../models/Media');
var Person = require('../models/Person');

var RequestStatus = require('../constants/requestStatus');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');
var RequestMsg = require('../constants/requestMsg');
const https = require('https');
var RedisClient = require('../utils/lib/redisClient');
var TMDBController = require('../external/TMDBController');
var mongoose       = require('mongoose');
const redisClient = RedisClient.createAndAuthClient();

exports.index = function(req, res) {
  Movie.find({})
  .catch((err) => {
    res.status(400).send(err);
  })
  .then((movie_result) => {
    var final_result = [];
    console.log("len:" + movie_result.length)
    if (movie_result.len == 0)
    res.status(200).send(final_result);
    movie_result.forEach((movie, index)=>{
      var tmdb_id = movie._tmdb_id;
      console.log("current indexing:" + tmdb_id);
      var query = 'movie/' + tmdb_id;
      redisClient.exists(query, function(err, reply) {
        if (reply === 1) {
          redisClient.get(query, async function(err,data) {
            if(err)
            console.log(err)
            else{
              console.log('got query from redis: movie/' + tmdb_id);
              var parsed_result = JSON.parse(data);
              parsed_result.poster_path = "https://image.tmdb.org/t/p/w500" + parsed_result.poster_path;
              parsed_result._id = movie._id;
              parsed_result.__t = movie.__t;
              parsed_result.backdrop_path = "https://image.tmdb.org/t/p/original" + parsed_result.backdrop_path;
              final_result.push(parsed_result);
              if (final_result.length == movie_result.length) {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).send(final_result);
              }
            }
          });
        } else {
          TMDBController.getMovieFromTMDB(tmdb_id).then(async function(data) {
            console.log("Got from TMDB: " + tmdb_id )
            data._id = movie_result._id;
            data.__t = movie_result.__t;
            final_result.push(data)
            if (final_result.length == movie_result.length) {
              res.setHeader('Content-Type', 'application/json');
              res.status(200).send(final_result);
            }
          })
        }
      });
    })
  });
};

exports.show = function(req, res) {
  var movie;
  if (mongoose.Types.ObjectId.isValid(req.params.movie_id)) {
    movie = Movie.findById(req.params.movie_id);
  } else {
    movie = Movie.findOne({_tmdb_id: req.params.movie_id});
  }

  movie.catch((err) => {
    res.status(400).send(err);
  })
  .then((result) => {
    if (result) {
      var tmdb_id = result._tmdb_id;
      var query = 'movie/' + tmdb_id
      redisClient.exists(query, function(err, reply) {
        if (reply === 1) {
          redisClient.get(query, async function(err,data) {
            if(err)
            console.log(err)
            else{
              console.log('got query from redis: movie/' + tmdb_id);
              var parsed_result = JSON.parse(data);
              var actors = result._actors;
              let actorsPromises = actors.map(injectPersonJson);
              parsed_result.poster_path = "https://image.tmdb.org/t/p/w500" + parsed_result.poster_path;
              parsed_result._id = result._id;
              parsed_result.__t = result.__t;
              await Promise.all(actorsPromises).then(function(nested_actors) {
                parsed_result._actors = nested_actors;
                parsed_result.backdrop_path = "https://image.tmdb.org/t/p/original" + parsed_result.backdrop_path;
                res.setHeader('Content-Type', 'application/json');
                res.status(200).send(parsed_result);
              });
            }
          });
        } else {
          TMDBController.getMovieFromTMDB(tmdb_id).then(async function(data) {
            var data = JSON.parse(data)
            data._id = result._id;
            data.__t = result.__t;
            res.status(RequestStatus.OK).send(data);
          })
        }
      });
    } else {
      res.status(RequestStatus.NOT_FOUND).send('Media not found.');
    }
  });
};

exports.create = function(req, res) {
  var movie = new Movie(req.body);

  movie.save()
  .catch((err) => {
    res.status(400).send(err);
  })
  .then((createdMovie) => {
    console.log("Created movie: " + createdMovie.name)
    TMDBController.getMovieFromTMDB(createdMovie._tmdb_id).then( async (result)=> {
      result._id = createdMovie._id;
      result._seasons = createdMovie._seasons;
      result.__t = createdMovie.__t;
      result._actors = await matchApiMovieCastToDb(createdMovie);
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(result);
    })
  });
};

exports.update = function(req, res) {
  Movie.findById(req.params.movie_id)
  .catch((err) => {
    res.status(RequestStatus.BAD_REQUEST).send(err);
  })
  .then((movie) => {
    if (req.body.name) movie.name = req.body.name;
    if (req.body.overview) movie.overview = req.body.overview;
    if (req.body.release_date) movie.release_date = req.body.release_date;
    if (req.body._directors) movie._directors = req.body._directors;
    if (req.body._actors) movie._actors = req.body._actors;
    if (req.body.imdb_id) movie.imdb_id = req.body.imdb_id;
    if (req.body.genres) movie.genres = req.body.genres;
    if (req.body.images) movie.images = req.body.images;
    if (req.body.isBoxOffice) movie.isBoxOffice = req.body.isBoxOffice;

    movie.save()
    .catch((err) => {
      res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((updatedMovie) => {
      res.status(RequestStatus.OK).json(updatedMovie);
    });
  });
};

exports.delete = function(req, res) {
  try {
    DataStoreUtils.deleteMediaById(req.params.movie_id);
    res.status(RequestStatus.OK).send('Movie removed.');
  } catch (err) {
    console.log(err);
    res.status(RequestStatus.BAD_REQUEST).send(err);
  }
};

getMovieCastFromAPI = function(movie_id){
  return new Promise(function(resolve, reject) {
    https.get("https://api.themoviedb.org/3/movie/"+ movie_id + "/credits"+"?api_key=db00a671b1c278cd4fa362827dd02620",
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

matchApiMovieCastToDb = async function(dbmovieshow){
  getMovieCastFromAPI(dbmovieshow._tmdb_id).then(function(credits){
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
        await createAppearsIn(created_db_person._id, dbmovieshow._id);
        if (nCast == castSize) done();
        console.log("Person Created:" + name)
      }).catch((err)=>{console.log(err)});
    });

    function done() {
      return castIds;
    }

  });
}
