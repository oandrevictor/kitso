var kitso = angular.module('kitso');

kitso.service('AuthService', ['$q', '$http', function ($q, $http) {
    const url = '/api/user/';

    // return available functions for use in the controllers
    return ({
        register: register
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
}]);