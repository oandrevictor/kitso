var kitso = angular.module('kitso');

kitso.service('AuthService', ['$q', '$http', function ($q, $http) {

    // return available functions for use in the controllers
    return ({
        register: register,
        login: login
    });

    function register(user) {
        // create a new instance of deferred
        var deferred = $q.defer();

        if (user.password === user.conf_pass) {
            $http.post('/api/user/', user)
                .then(function (data) {
                    if (data.status === 200) {
                        deferred.resolve();
                    } else {
                        deferred.reject();
                    }
                })
                .catch(function (error) {
                    deferred.reject(error.data);
                });
        } else {
            deferred.reject();
        }      
        
        return deferred.promise;
    }

    function login(user) {
        // create a new instance of deferred
        var deferred = $q.defer();

        $http.post('/api/user/login', user)
            .then(function (data) {
                console.log(data);
                if (data.status === 200) {
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