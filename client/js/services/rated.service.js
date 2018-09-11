var kitso = angular.module('kitso');

kitso.service('RatedService', ['$q','$http', function ($q, $http) {

    var rated = false;
    var rateds = {};

    // return available functions for use in the controllers
    return ({
      getAllRated: getAllRated,
      getRated: getRated,
      getVoteAverage: getVoteAverage,
      markAsRated: markAsRated,
      markAsNotRated: markAsNotRated,
      isRated: isRated,
      updateRated: updateRated,
      topRated: topRated
    });

    function getAllRated(userId){
      var deferred = $q.defer();
      $http.get('/api/rated?user=' + userId)
          .then((response) => {
            if (response.status === 200) {
              var result = response.data;
              result.forEach(function(rated){
                if(rated._media.helper){
                  rated._media.helper = JSON.parse(rated._media.helper)
                }
                if(typeof rated._media.helper === 'string' || rated._media.helper instanceof String){
                  rated._media.helper = JSON.parse(rated._media.helper)
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

    function getRated(ratedId){
      var deferred = $q.defer();
      $http.get('/api/rated/' + ratedId)
          .then((response) => {
            if (response.status === 200) {
                  deferred.resolve(response.data);
              } else {
                  deferred.reject(response.data);
              }
          })
          .catch((error) => {
              deferred.reject(error.data);
          });

      return deferred.promise;
    }

    function getVoteAverage(mediaId){
      var deferred = $q.defer();
      $http.get('/api/rated/media_rate_average?media_id=' + mediaId)
          .then((response) => {
            if (response.status === 200) {
                  deferred.resolve(response.data);
              } else {
                  deferred.reject(response.data);
              }
          })
          .catch((error) => {
              deferred.reject(error.data);
          });

      return deferred.promise;
    }

    function markAsRated(userId, mediaId, date = moment(), rating) {
        var deferred = $q.defer();

        var data = {
            "_user": userId,
            "_media": mediaId,
            "date" : date,
            "rating" : rating
        };

        $http.post('/api/rated/', data)
            .then((response) => {
                if (response.status === 200) {
                  response.data.rated_id = response.data._id
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


    function updateRated(rated) {
        var deferred = $q.defer();
        var rating = rated.rating;

        var data = {
            "rating" : rating
        };

        $http.put('/api/rated/' + rated._id, data)
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


    function markAsNotRated(ratedId) {
        var deferred = $q.defer();

        $http.delete('/api/rated/' + ratedId)
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

    function isRated(userId, mediaId) {
        var deferred = $q.defer();
        $http.get('/api/rated/is_rated?user_id='+ userId + "&media_id="+mediaId)
            .then((response) => {
                if (response.status === 200) {
                    rated = response.data.is_rated;
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

    function topRated(userId, type) {
      var deferred = $q.defer();
      $http.get('/api/rated/top_rated?user_id=' + userId + "&type=" + type + "&limit=5")
          .then((response) => {
            if (response.status === 200) {
                  deferred.resolve(response.data);
              } else {
                  deferred.reject(response.data);
              }
          })
          .catch((error) => {
              deferred.reject(error.data);
          });

      return deferred.promise;
    }

}]);
