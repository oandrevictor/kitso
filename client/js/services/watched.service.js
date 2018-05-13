var kitso = angular.module('kitso');

kitso.service('WatchedService', ['$q','$http', function ($q, $http) {

    var isWatched = false;
    var watcheds = {};

    // return available functions for use in the controllers
    return ({
        markAsWatched: markAsWatched,
        markAsNotWatched: markAsNotWatched,
        getIsWatched: getIsWatched
    });

    function markAsWatched(userId, mediaId) {
        var deferred = $q.defer();

        var data = {
            "_user": userId,
            "_media": mediaId
        };

        $http.post('/api/watched/', data)
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

    function markAsNotWatched(mediaId) {
        var deferred = $q.defer();

        $http.delete('/api/watched/' + mediaId)
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

    function getWatcheds(userId) {
        var deferred = $q.defer();

        $http.get('/api/watched/' + userId)
            .then((response) => {
                if (response.status === 200) {
                    watcheds = response.data;
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

        $http.get('/api/watched/'+ userId)
            .then((response) => {
                if (response.status === 200) {
                    watcheds = response.data;

                    for (var i = 0; i < watched.length; i++) {
                      if (watcheds[i]['_id'] === mediaId) {
                        isWatched = true;
                      }
                    }

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

    function getIsWatched() {
      return isWatched;
    }
}]);
