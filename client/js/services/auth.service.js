angular.module('AuthService').factory('AuthService', ['$q', '$timeout', '$http',
    function ($q, $timeout, $http) {

        // create user variable
        var user = null;

        // return available functions for use in the controllers
        return ({
            register: register
        });

        function register(user) {

            // create a new instance of deferred
            var deferred = $q.defer();

            if (user.password === user.conf_pass) {

                $http.post('/api/user/', user)
                    .success(function (data, status) {
                        if (status === 200 && data.status) {
                            deferred.resolve();
                        } else {
                            deferred.reject();
                        }
                    })
                    .error(function (data) {
                        deferred.reject();
                    });
            } else {
                deferred.reject();
            }      
            
            return deferred.promise;
        }
    }
]);