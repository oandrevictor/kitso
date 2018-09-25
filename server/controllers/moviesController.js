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

exports.index = async function(req, res) {
  let page;
  if (req.query.page)
    page = parseInt(req.query.page);
  else
    page = 0;

  Movie.find({}).sort({date: -1}).skip(page * 9).limit(9)
  .catch((err) => {
    res.status(400).send(err);
  })
  .then((movie_result) => {
    var final_result = [];
    if (movie_result.length == 0)
    res.status(200).send(final_result);
    movie_result.forEach(async function(movie, index){
      var tmdb_id = movie._tmdb_id;
      var movie_complete = await TMDBController.getMovie(tmdb_id);
      if (typeof movie_complete === 'string' || movie_complete instanceof String)
        movie_complete = JSON.parse(movie_complete)
      final_result.push(movie_complete);
      if (final_result.length == movie_result.length) {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(final_result);
      }
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
  .then(async function(result) {
    if (result) {
      var tmdb_id = result._tmdb_id;
      let movie_complete = await TMDBController.getMovie(tmdb_id);
      var actors = result._actors;
      let actorsPromises = actors.map(injectPersonJson);
      await Promise.all(actorsPromises).then(function(nested_actors) {
        movie_complete._actors = nested_actors;
      });
      res.setHeader('Content-Type', 'application/json');
      res.status(RequestStatus.OK).send(movie_complete);
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
    console.log("Created movie: " + createdMovie.name);
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
};

matchApiMovieCastToDb = async function(dbmovieshow){
  getMovieCastFromAPI(dbmovieshow._tmdb_id).then(function(credits) {
    var credits = JSON.parse(credits);
    var cast = credits.cast;
    var castSize = cast.length;
    var nCast = 0;
    var castIds = [];

    cast.forEach(async function(person, i) {
      var tmdb_id = person.id;
      var name = person.name;
      var character = person.character;
      var picture = person.profile_path;
      var description = "No description yet";
      var db_person;

      let hasPerson = await DataStoreUtils.findPersonByTmdbId(tmdb_id);

      if (hasPerson.length === 0) {
        // person does not exists
        db_person = new Person();
        db_person.name = name;
        db_person._tmdb_id = tmdb_id;
        db_person.image_url = picture;
        db_person.description = description;
        db_person.save().then(async (created_db_person)=>{
          nCast++;
          castIds[i] = created_db_person._id;
          await createAppearsIn(created_db_person._id, dbmovieshow._id);
          if (nCast === castSize)
            done();
          console.log("Person Created:" + name);
        }).catch((err)=>{console.log(err)});
      }
      else {
        // person already exists
        await createAppearsIn(hasPerson[0]._id, dbmovieshow._id);
        console.log("Person Updated:" + name);
      }
    });

    function done() {
      return castIds;
    }
  });
};

injectPersonJson = async function(personId) {
    let personObj = await DataStoreUtils.getPersonObjById(personId);
    return personObj;
};