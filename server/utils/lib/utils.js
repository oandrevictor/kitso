var MediaType =  require('../../constants/mediaType');

exports.removeItemFromList = function(item, list) {
  let index = list.indexOf(item);
  if (index > -1) {
    list.splice(index, 1);
  }
};

exports.filterWatchedMedia = function(mediasList, query) {
  let filteredMediaList = mediasList;
  
  if (query.month || query.year) {
    let jsMonthOffset = 1;
    filteredMediaList = exports.filterWatchedMediaByTime(filteredMediaList, query.month - jsMonthOffset, query.year);
  }
  
  if (query.media_type) {
    filteredMediaList = exports.filterWatchedMediaByMediaType(filteredMediaList, query.media_type);
  }
  
  return filteredMediaList;
};

exports.filterWatchedMediaByTime = function(mediasList, month, year) {
  let filteredMediaList;
  
  if (!year) {
    return mediasList;
    
  } else if (month && year) {
    filteredMediaList = mediasList.filter( function(watchedMedia) {
      let watchDate = watchedMedia.date;
      return watchDate.getMonth() === Number(month) && watchDate.getFullYear() === Number(year);
    } );
    
  } else if (!month) {
    filteredMediaList = mediasList.filter( function(watchedMedia) {
      return watchedMedia.date.getFullYear() === Number(year);
    } );
  }
  
  return filteredMediaList;
};

exports.filterWatchedMediaByMediaType = function(mediasList, mediaType) {
  return mediasList.filter( function(watchedMedia) {
    let media = watchedMedia._media;
    
    if (mediaType === "movie") {
      return media.__t === MediaType.MOVIE;
      
    } else if (mediaType === "tvshow") {
      return media.__t === MediaType.EPISODE || media.__t === MediaType.SEASON || media.__t === MediaType.TVSHOW
    }
    
  } );
};