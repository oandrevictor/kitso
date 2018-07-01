var kitso = angular.module('kitso');

kitso.service('UserService', ['$q', '$http', function ($q, $http) {

    return ({
        findByEmail: findByEmail,
        sendPasswordRecoverEmail: sendPasswordRecoverEmail,
        updateUserPassword: updateUserPassword,
        editUser: editUser,
        getUser: getUser,
        getTimespent: getTimespent
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



    function getTimespent(userId, data){
      var deferred = $q.defer();
      $http.post('/api/user/' + userId + '/timespent', data)
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

    function findByEmail(email) {
        var deferred = $q.defer();

        $http.post('/api/user/email', email)
            .then(function (response) {
                if (response.status === 200) {
                    deferred.resolve(response.data);
                } else {
                    deferred.reject();
                }
            })
            .catch(function (error) {
                deferred.reject(error.data);
            });

        return deferred.promise;
    }

    function sendPasswordRecoverEmail(email) {
        var deferred = $q.defer();

        $http.post('/api/email/passwordRecover', email)
            .then(function (response) {
                if (response.status === 200) {
                    deferred.resolve(response.data);
                } else {
                    deferred.reject();
                }
            })
            .catch(function (error) {
                deferred.reject(error.data);
            });

        return deferred.promise;
    }

    function updateUserPassword(email) {
        var deferred = $q.defer();
        var body = {email: email};

        $http.post('/api/user/password', body)
            .then(function (response) {
                if (response.status === 200) {
                    deferred.resolve(response.data);
                } else {
                    deferred.reject();
                }
            })
            .catch(function (error) {
                deferred.reject(error.data);
            });

        return deferred.promise;
    }

    function editUser(user) {
        var deferred = $q.defer();

        $http.put('/api/user/' + user._id, user)
            .then(function (response) {
                if (response.status === 200) {
                    user.user = response.data;
                    deferred.resolve();
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
