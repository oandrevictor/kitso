var kitso = angular.module('kitso');

kitso.service('FeedService', ['$q','$http', function ($q, $http) {

  var FOLLOWING_FEED_BASE = 'api/follows/followed_activity/'

    // return available functions for use in the controllers
    return ({
        getFollowingUsersActivity: getFollowingUsersActivity,
    });

    function getFollowingUsersActivity(userId){
      var deferred = $q.defer();
      $http.get(FOLLOWING_FEED_BASE + userId)
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
