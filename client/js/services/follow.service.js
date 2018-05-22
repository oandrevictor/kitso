var kitso = angular.module('kitso');

kitso.service('FollowService', ['$q','$http', function ($q, $http) {

  var USERS_FOLLOW_URL = '/api/follows/'
  var PAGES_FOLLOW_URL = '/api/followsPage/'

    // return available functions for use in the controllers
    return ({
        getUsersFollowing: getUsersFollowing,
        getUsersFollowers: getUsersFollowers,
        getPagesFollowing: getPagesFollowing,
        unfollowPage: unfollowPage,
        unfollowUser: unfollowUser,
        isFollowingPage: isFollowingPage,
        isFollowingUser: isFollowingUser,
        followPage: followPage,
        followUser: followUser
    });

    function getFollowing(userId, url){
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

    function getFollowers(userId, url){
      var deferred = $q.defer();
      $http.get(url + 'following_me?user_id=' + userId)
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

    function getUsersFollowers(userId) {
      var deferred = $q.defer();
      getFollowers(userId, USERS_FOLLOW_URL)
          .then((response) => {
            following = response;
            if (response) {
                following = response;
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
            following = response;
            if (response) {
                following = response;
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
            if (response) {
                following = response;
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

    function unfollowPage(followsId) {
      var deferred = $q.defer();

      $http.delete('/api/followsPage/' + followsId)
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
        $http.get('/api/followsPage/is_following?user_id='+ userId + "&following_id=" + mediaId)
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

    function isFollowingUser(userId, user2Id) {
        var deferred = $q.defer();
        $http.get('/api/follows/is_following?user_id='+ userId + "&following_id=" + user2Id)
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

    function followPage(userId, mediaId, date = moment()) {
        var deferred = $q.defer();

        var data = {
            "_user": userId,
            "_following": mediaId,
            "is_media" : true
        };

        $http.post('/api/followsPage/', data)
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

    function followUser(userId, user2Id, date = moment()) {
        var deferred = $q.defer();

        var data = {
            "_user": userId,
            "_following": user2Id
        };

        $http.post('/api/follows/', data)
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

    function unfollowUser(followsId) {
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
}]);
