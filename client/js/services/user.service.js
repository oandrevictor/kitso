var kitso = angular.module('kitso');

kitso.service('UserService', ['$q','$http', function ($q, $http) {

    var watched = false;
    var watcheds = {};

    // return available functions for use in the controllers
    return ({
      getUser: getUser
    });

    function getUser(userId){
      var deferred = $q.defer();
      $http.get('/api/user/' + userId)
          .then((response) => {
            if (response.status === 200) {
              var user = response.data;
              user.birthday = new Date(user.birthday);
                  deferred.resolve(user);
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
