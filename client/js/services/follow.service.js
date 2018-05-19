var kitso = angular.module('kitso');

kitso.service('FollowService', ['$q','$http', function ($q, $http) {

  var USERS_FOLLOW_URL = '/api/follows/'
  var PAGES_FOLLOW_URL = '/api/followsPage/'
    var movie = {};

    // return available functions for use in the controllers
    return ({
        getUsersFollowing: getUsersFollowing,
        getPagesFollowing: getPagesFollowing,
        unfollow: unfollow,
        isFollowing: isFollowing
    });

    var getFollowing = function(userId, url){
      var deferred = $q.defer();
      $http.get(url +'user/' + userId)
          .then((response) => {
              if (response.status === 200) {
                  following = response.data;
                  deferred.resolve(following);
              } else {
                  deferred.reject();
              }
          })
          .catch((error) => {
              deferred.reject(error.data);
          });
      return deferred.promise;

    }

    function getUsersFollowing(userId) {
      var deferred = $q.defer();
      getFollowing(userId, USERS_FOLLOW_URL)
          .then((response) => {
            if (response.status === 200) {
                following = response.data;
                deferred.resolve(following);
            } else {
                deferred.reject();
            }
        })
        .catch((error) => {
            deferred.reject(error.data);
        });
        return deferred.promise;
    }

    function getPagesFollowing(userId) {
      var deferred = $q.defer();
      getFollowing(userId, PAGES_FOLLOW_URL)
          .then((response) => {
            if (response.status === 200) {
                following = response.data;
                deferred.resolve(following);
            } else {
                deferred.reject();
            }
        })
        .catch((error) => {
            deferred.reject(error.data);
        });
      return deferred.promise;
    }

    function unfollow(followsId) {
      var deferred = $q.defer();

      $http.delete('/api/follows/' + followsId)
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

    function isFollowingPage(userId, mediaId) {
        var deferred = $q.defer();
        $http.get('/api/followsPage/is_watched?user_id='+ userId + "&following_id="+mediaId)
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
