var RequestStatus = require('../constants/requestStatus');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');

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

