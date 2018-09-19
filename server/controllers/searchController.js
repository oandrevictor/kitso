var RequestStatus = require('../constants/requestStatus');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');
var Person = require('../models/Person');
var Media = require('../models/Media');
var User = require('../models/User');

exports.getTaggable = async function(req, res) {
  var all = []
  var name = req.body.name.toLowerCase();
  var medias = await getMedias(name)

  var persons = await Person.find({ "name": { $regex: '.*' + name + '.*', $options: 'i' }} ).limit(4)
  .catch((err) => {
    console.log("Error catching in Person:" + name)
    return []
  })
  .then((result) => {
    return(result)
  });

  var users = await User.find({ "name": { $regex: '.*' + name + '.*', $options: 'i' }} ).limit(4)
  .catch((err) => {
    console.log("Error catching in User:" + name)
    return []
  })
  .then((result) => {
    return(result)
  });
  all = all.concat(medias)
  all = all.concat(persons)
  all = all.concat(users)
  res.status(RequestStatus.OK).json(all.slice(0,5))
}

var getMedias = async function(name) {
  var searchedMedia = await Media.find({ $and: [ {"name": { $regex: '.*' + name + '.*', $options: 'i' }}, { __t: { $ne: 'Episode' }}]} ).limit(4)
  .catch((err) => {
    console.log("Error catching in Media:" + name)
    console.log(err)
    return []
  })
  .then((result) => {
    return(result)
  });

  var mediasWithInfoFromDBPromisses = [];

  searchedMedia.forEach((media) => {
    mediasWithInfoFromDBPromisses.push(DataStoreUtils.getMediaWithInfoFromDB(media));
  });

  var medias = [];
  await Promise.all(mediasWithInfoFromDBPromisses).then((result) => {
    medias = result;
  });

  return medias;
}

exports.index = async function(req, res) {
  let type = req.query.type;
  let search = req.query.search;
  try {
    if (type === 'media') {
      let searchedMedia = await DataStoreUtils.searchMediaByName(search);

      var mediasWithInfoFromDBPromisses = [];

      searchedMedia.forEach((media) => {
        mediasWithInfoFromDBPromisses.push(DataStoreUtils.getMediaWithInfoFromDB(media));
      });

      var medias = [];
      await Promise.all(mediasWithInfoFromDBPromisses).then((result) => {
        medias = result;
      });

      res.status(RequestStatus.OK).json(medias);

    } else if (type === 'person') {
      let searched_item = await DataStoreUtils.searchPersonByName(search);
      res.status(RequestStatus.OK).json(searched_item);
    } else if (type === 'user') {
      let searched_item = await DataStoreUtils.searchUserByName(search);
      res.status(RequestStatus.OK).json(searched_item);
    } else {
      res.status(RequestStatus.BAD_REQUEST).send('Not found');
    }
  } catch (err) {
    res.status(RequestStatus.BAD_REQUEST).json(err);
  }
};
