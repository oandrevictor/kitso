var kitso = angular.module('kitso');

kitso.service('UserService', ['$q', '$http', function ($q, $http) {

    return ({
        findByEmail: findByEmail,
        sendPasswordRecoverEmail: sendPasswordRecoverEmail,
        editUser: editUser
    });

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