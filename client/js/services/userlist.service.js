var kitso = angular.module('kitso');

kitso.service('UserListService', ['$q', '$http', function ($q, $http) {

    return ({
        getUserList: getUserList
    });

    function getUserList(userListId){
      var deferred = $q.defer();
      $http.get('/api/userlist/' + userListId)
          .then((response) => {
            if (response.status === 200) {
              var userlist = response.data;
                  deferred.resolve(userlist);
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
