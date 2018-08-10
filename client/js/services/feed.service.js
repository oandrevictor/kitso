var kitso = angular.module('kitso');

kitso.service('FeedService', ['$q','$http', function ($q, $http) {

  var FOLLOWING_FEED_BASE = 'api/follows/followed_activity/'

    // return available functions for use in the controllers
    return ({
        getFollowingUsersActivity: getFollowingUsersActivity,
    });

    function getFollowingUsersActivity(userId, page){
      var deferred = $q.defer();
      var page_query = "";
      if (page){
        page_query = "?page=" + page;
      }
      $http.get(FOLLOWING_FEED_BASE + userId + page_query)
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
