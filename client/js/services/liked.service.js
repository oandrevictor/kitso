var kitso = angular.module('kitso');

kitso.service('LikedService', ['$q','$http', function ($q, $http) {

    API_LIKE_BASE = '/api/liked/'
    // return available functions for use in the controllers
    return ({
        like: like,
        isLiked: isLiked,
        undoLike: undoLike,
        getNumLikes, getNumLikes
    });

    function isLiked(userId, itemId){
      var query = "?user_id=" + userId + "&activity_id=" + itemId;
      var deferred = $q.defer();
      $http.get(API_LIKE_BASE + 'is_liked' + query)
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

    function like(userId, itemId){
      var deferred = $q.defer();
      var liked = { "_user": userId,
                  "_activity": itemId }

      $http.post(API_LIKE_BASE, liked)
          .then(function (data) {
              if (data.status === 200) {
                  deferred.resolve(data);
              } else {
                  deferred.reject(data);
              }
          })
          .catch(function (error) {
              deferred.reject(error.data);
          });
      return deferred.promise;
    };

    function undoLike(like){
      var deferred = $q.defer();
      $http.delete(API_LIKE_BASE + like._id)
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

    };

    function getNumLikes(itemId){

    };

}]);
