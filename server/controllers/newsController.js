
var News = require('../models/News');
var Related = require('../models/Related');
var Person = require('../models/Person');
var Media = require('../models/Media');
var RequestStatus = require('../constants/requestStatus');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');
var TMDBController = require('../external/TMDBController');


exports.index = function(req, res) {
  News.find({})
  .catch((err) => {
    res.status(RequestStatus.BAD_REQUEST).send(err);
  })
  .then(async function(news) {
    let promise;

    try {
      promise = await news.map(inject_related);
    } catch (err) {
      res.status(RequestStatus.BAD_REQUEST).send(err);
    }

    Promise.all(promise).then((results) => {
      res.status(RequestStatus.OK).json(results);
    });
  });
};

exports.show = function(req, res) {
  News.findById(req.params.news_id)
  .catch((err) => {
    res.status(RequestStatus.BAD_REQUEST).send(err);
  })
  .then(async function(news) {
    let complete_new = await inject_related(news);
    res.status(RequestStatus.OK).json(complete_new);
  });
};

exports.create = async function(req, res) {
  var news_obj = new News(req.body);
  try {
    var news = await create_news(news_obj);

    let news_id = news._id;
    let user_id = req.body._user;
    let medias = req.body.medias_ids;
    let people = req.body.people_ids;

    let relateds = [];
    for (var i = 0; i < medias.length; i++) {
      let media_related = await create_related(user_id, news_id, true, medias[i]);
      relateds.push(media_related);
    }
    for (var i = 0; i < people.length; i++) {
      let people_related = await create_related(user_id, news_id, false, people[i]);
      relateds.push(people_related);
    }

    news._related = relateds;
    await news.save();
    res.status(RequestStatus.OK).send(news);
  } catch(err) {
    console.log(err);
    res.status(RequestStatus.BAD_REQUEST).send(err);
  }
};

exports.update = function(req, res) {
  News.findById(req.params.news_id)
  .catch((err) => {
    res.status(RequestStatus.BAD_REQUEST).send(err);
  })
  .then((news) => {
    if (req.body._posted_by) news._posted_by = req.body._posted_by;
    if (req.body.link) news.link = req.body.link;
    if (req.body.date) news.date = req.body.date;
    if (req.body._related) news._related = req.body._related;

    news.save()
    .catch((err) => {
      res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((updatedNews) => {
      res.status(RequestStatus.OK).json(updatedNews);
    });
  });
};

exports.delete = async function(req, res) {
  try {
    var news = await find_news_obj(req.params.news_id);
    var relateds_ids = news._related;
    await delete_relateds(relateds_ids);
    await delete_news(req.params.news_id);
  } catch(err) {
    console.log(err);
    res.status(RequestStatus.BAD_REQUEST).send(err);
  }
  res.status(RequestStatus.OK).send('News deleted.');
};

var inject_related = async function(news) {
  let complete_news = JSON.parse(JSON.stringify(news));
  let relateds = complete_news._related;
  let related_objs = [];
  for (var i = 0; i < relateds.length; i++) {
    let related_obj = await Related.findById(relateds[i]).exec();
    let complete_related = JSON.parse(JSON.stringify(related_obj));
    if (complete_related.is_media) {
      let media_obj = await Media.findById(complete_related._media).exec();
      let media_from_TMDB = await DataStoreUtils.getMediaWithInfoFromDB(media_obj);
      complete_related._media = media_from_TMDB;
    } else {
      let person_obj = await Person.findById(complete_related._person).exec();
      let person_from_TMDB = await TMDBController.getPersonFromTMDB(person_obj._tmdb_id);
      complete_related._person = person_from_TMDB;
    }

    related_objs.push(complete_related);
  }
  complete_news._related = related_objs;

  return complete_news;
}

var create_news = function(news_obj) {
  return news_obj.save();
}

var create_related = function(user_id, news_id, is_media, object_id) {
  let media_id, person_id;

  if (is_media) {
    media_id = object_id;
  } else {
    person_id = object_id;
  }

  let related_structure = {
    _user: user_id,
    _news: news_id,
    is_media: is_media,
    _media: media_id,
    _person: person_id
  }

  let related = new Related(related_structure);
  related.save();

  return related._id;
}

var find_news_obj = function(news_id) {
  return News.findById(news_id).exec();
}

var delete_relateds = function(relateds_ids) {
  relateds_ids.forEach(async function (related_id) {
    await Related.remove({ _id: related_id}).exec();
  })
}

var delete_news = function(news_id) {
  return News.remove({ _id: news_id}).exec();
}
