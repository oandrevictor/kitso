var kitso = angular.module('kitso');

kitso.service('WatchedService', ['$q', '$http', function ($q, $http) {

  var watched = false;
  var watcheds = {};

  // return available functions for use in the controllers
  return ({
    getAllWatched: getAllWatched,
    markAsWatched: markAsWatched,
    markSeasonAsWatched: markSeasonAsWatched,
    markEntireSeasonAsWatched: markEntireSeasonAsWatched,
    markSeasonAsNotWatched: markSeasonAsNotWatched,
    markEntireTvshowAsWatched: markEntireTvshowAsWatched,
    markTvshowAsWatched: markTvshowAsWatched,
    markTvshowAsNotWatched: markTvshowAsNotWatched,
    markAsNotWatched: markAsNotWatched,
    isWatched: isWatched,
    seasonProgress: seasonProgress,
    tvshowProgress: tvshowProgress,
    updateWatched: updateWatched
  });

  function getAllWatched(userId) {
    var deferred = $q.defer();
    $http.get('/api/watched?user=' + userId)
      .then((response) => {
        if (response.status === 200) {
          var result = response.data;
          result.forEach(function (watched) {
            if (watched._media.helper) {
              watched._media.helper = JSON.parse(watched._media.helper)
            }
          })
          deferred.resolve(result);
        } else {
          deferred.reject();
        }
      })
      .catch((error) => {
        console.log(error);
        deferred.reject(error.data);
      });

    return deferred.promise;
  }


  function markAsWatched(userId, mediaId, timespent, date = moment()) {
    var deferred = $q.defer();

    var data = {
      "_user": userId,
      "_media": mediaId,
      "date": date,
      "time_spent": timespent
    };

    $http.post('/api/watched/', data)
      .then((response) => {
        if (response.status === 200) {
          response.data.watched_id = response.data._id
          deferred.resolve(response.data);
        } else {
          deferred.reject();
        }
      })
      .catch((error) => {
        deferred.reject(error.data);
      });

    return deferred.promise;
  }

  function markEntireSeasonAsWatched(userId, seasonId, timespent, date = moment()) {
    var deferred = $q.defer();

    var data = {
      "userId": userId,
      "seasonId": seasonId,
      "date": date,
      "time_spent": timespent
    };

    $http.post('/api/watched/entireSeason', data)
      .then((response) => {
        if (response.status === 200) {
          deferred.resolve(response.data);
        } else {
          deferred.reject();
        }
      })
      .catch((error) => {
        deferred.reject(error.data);
      });

    return deferred.promise;
  }

  function markSeasonAsWatched(userId, seasonId, timespent, date = moment()) {
    var deferred = $q.defer();

    var data = {
      "userId": userId,
      "seasonId": seasonId,
      "date": date,
      "time_spent": timespent
    };

    $http.post('/api/watched/season', data)
      .then((response) => {
        if (response.status === 200) {
          deferred.resolve(response.data);
        } else {
          deferred.reject();
        }
      })
      .catch((error) => {
        deferred.reject(error.data);
      });

    return deferred.promise;
  }

  function markSeasonAsNotWatched(episodesIds, userId) {
    var deferred = $q.defer();

    var data = {
      "episodesIds": episodesIds,
      "userId": userId
    };

    $http.post('/api/watched/season/unwatch', data)
      .then((response) => {
        if (response.status === 200) {
          deferred.resolve(response.data);
        } else {
          deferred.reject();
        }
      })
      .catch((error) => {
        deferred.reject(error.data);
      });

    return deferred.promise;
  }

  function markEntireTvshowAsWatched(userId, tvshowId, timespent, date = moment()) {
    var deferred = $q.defer();

    var data = {
      "userId": userId,
      "tvshowId": tvshowId,
      "date": date,
      "time_spent": timespent
    };

    $http.post('/api/watched/entireTvshow', data)
      .then((response) => {
        if (response.status === 200) {
          deferred.resolve(response.data);
        } else {
          deferred.reject();
        }
      })
      .catch((error) => {
        deferred.reject(error.data);
      });

    return deferred.promise;
  }

  function markTvshowAsWatched(userId, tvshowId, timespent, date = moment()) {
    var deferred = $q.defer();

    var data = {
      "userId": userId,
      "tvshowId": tvshowId,
      "date": date,
      "time_spent": timespent
    };

    $http.post('/api/watched/tvshow', data)
      .then((response) => {
        if (response.status === 200) {
          deferred.resolve(response.data);
        } else {
          deferred.reject();
        }
      })
      .catch((error) => {
        deferred.reject(error.data);
      });

    return deferred.promise;
  }

  function markTvshowAsNotWatched(_seasons, userId) {
    var deferred = $q.defer();

    var data = {
      "seasons": _seasons,
      "userId": userId
    };

    $http.post('/api/watched/tvshow/unwatch', data)
      .then((response) => {
        if (response.status === 200) {
          deferred.resolve(response.data);
        } else {
          deferred.reject();
        }
      })
      .catch((error) => {
        deferred.reject(error.data);
      });

    return deferred.promise;
  }


  function updateWatched(watched) {
    var deferred = $q.defer();
    var date = watched.date;

    var data = {
      "date": date
    };

    $http.put('/api/watched/' + watched._id, data)
      .then((response) => {
        if (response.status === 200) {
          deferred.resolve(response.data);
        } else {
          deferred.reject();
        }
      })
      .catch((error) => {
        deferred.reject(error.data);
      });

    return deferred.promise;
  }


  function markAsNotWatched(watchedId) {
    var deferred = $q.defer();

    $http.delete('/api/watched/' + watchedId)
      .then((response) => {
        if (response.status === 200) {
          deferred.resolve();
        } else {
          deferred.reject();
        }
      })
      .catch((error) => {
        deferred.reject(error.data);
      });

    return deferred.promise;
  }

  function isWatched(userId, mediaId) {
    var deferred = $q.defer();
    $http.get('/api/watched/is_watched?user_id=' + userId + "&media_id=" + mediaId)
      .then((response) => {
        if (response.status === 200) {
          watched = response.data.is_watched;
          deferred.resolve(response.data);
        } else {
          deferred.reject();
        }
      })
      .catch((error) => {
        deferred.reject(error.data);
      });

    return deferred.promise;
  }

  function seasonProgress(userId, seasonId) {
    var deferred = $q.defer();

    var data = {
      "userId": userId,
      "seasonId": seasonId
    };

    $http.post('/api/watched/season/progress', data)
      .then((response) => {
        if (response.status === 200) {
          deferred.resolve(response.data);
        } else {
          deferred.reject();
        }
      })
      .catch((error) => {
        deferred.reject(error.data);
      });

    return deferred.promise;
  }

  function tvshowProgress(userId, tvshowId) {
    var deferred = $q.defer();

    var data = {
      "userId": userId,
      "tvshowId": tvshowId
    };

    $http.post('/api/watched/tvshow/progress', data)
      .then((response) => {
        if (response.status === 200) {
          deferred.resolve(response.data);
        } else {
          deferred.reject();
        }
      })
      .catch((error) => {
        deferred.reject(error.data);
      });

    return deferred.promise;
  }

}]);
