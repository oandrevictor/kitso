var kitso = angular.module('kitso');

kitso.service('UserListService', ['$q','$http', function ($q, $http) {

    var userlist = {};

    // return available functions for use in the controllers
    return ({
        loadUserList: loadUserList,
        getUserList: getUserList,
        updateUserList: updateUserList
    });

    function loadUserList(id) {
        var deferred = $q.defer();

        $http.get('/api/userlist/' + id)
            .then((response) => {
                if (response.status === 200) {
                    userlist = response.data;
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

    function getUserList() {
        return userlist;
    }

    function updateUserList(userlist) {
      var deferred = $q.defer();

      $http.put('/api/userlist/' + userlist._id, userlist)
          .then(function (response) {
              if (response.status === 200) {
                  userlist = response.data;
                  deferred.resolve(userlist);
              } else {
                  deferred.reject();
              }
          })
          .catch(function (error) {
              deferred.reject(error.data);
          });

      return deferred.promise;
    }
}]);
