var kitso = angular.module('kitso');

kitso.service('WatchedService', ['$q', '$http', function ($q, $http) {

  var watched = false;
  var watcheds = {};

  // return available functions for use in the controllers
  return ({
    getAllWatched: getAllWatched,
    markAsWatched: markAsWatched,
    markSeasonAsWatched: markSeasonAsWatched,
    markAsNotWatched: markAsNotWatched,
    isWatched: isWatched,
    updateWatched: updateWatched
  });

  function getAllWatched(userId) {
    var deferred = $q.defer();
    $http.get('/api/watched/user/' + userId)
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
        deferred.reject(error.data);
      });

    return deferred.promise;
  }


  function markAsWatched(userId, mediaId, date = moment()) {
    var deferred = $q.defer();

    var data = {
      "_user": userId,
      "_media": mediaId,
      "date": date
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

  function markSeasonAsWatched(userId, episodesIds, seasonId, date = moment()) {
    var deferred = $q.defer();

    var data = {
      "_user": userId,
      "seasonId": seasonId,
      "episodesIds": episodesIds,
      "date": date
    };

    $http.post('/api/watched/season', data)
      .then((response) => {
        if (response.status === 200) {
          response.data.watched_id = response.data._id;
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

}]);
