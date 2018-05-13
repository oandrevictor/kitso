var kitso = angular.module('kitso');

kitso.controller('LoginController', ['$scope', '$location', '$timeout', 'AuthService', 'UserService', function($scope, $location, $timeout, AuthService, UserService) {

    $scope.submitForm = function() {
        var user = {
            username: $scope.userForm.username.$modelValue,
            password: $scope.userForm.password.$modelValue
        };

        if ($scope.userForm.$valid) {            
            AuthService.login(user)
                // handle success
                .then(function () {
                    UIkit.notification({
                        message: '<span uk-icon=\'icon: check\'></span> Logged! Redirecting...',
                        status: 'success',
                        timeout: 1500
                    });

                    $timeout(function() {
                        $location.path('/profile');
                        }, 1500);
                })
                // handle error
                .catch(function (error) {
                    var dangerMessage = error.err;

                    UIkit.notification({
                        message: '<span uk-icon=\'icon: check\'></span> ' + dangerMessage,
                        status: 'danger',
                        timeout: 2500
                    });
                });   
        };
    };

    $scope.isInvalid = function (field) {
        return (field.$invalid && !field.$pristine);
    };

    $scope.resetValidity = function () {
        if ($scope.userForm.$submitted) {
            $scope.userForm.password.$setValidity('password', true);
        }
    }

    $scope.recoverEmailAddress = '';

    $scope.recoverPassword = function() {
        UserService.findByEmail({ email: $scope.recoverEmailAddress })
            .then(() => {
                UserService.sendPasswordRecoverEmail({ email: $scope.recoverEmailAddress })
                    .then(() => {
                        UIkit.notification({
                            message: '<span uk-icon=\'icon: check\'></span> Recover email sent. Please verify your email.',
                            status: 'success',
                            timeout: 2000
                        });
                    })
                    .catch((error) => {
                        UIkit.notification({
                            message: '<span uk-icon=\'icon: check\'></span> ' + error,
                            status: 'danger',
                            timeout: 2000
                        });
                    });
            })
            .catch((error) => {
                UIkit.notification({
                    message: '<span uk-icon=\'icon: check\'></span> ' + error,
                    status: 'danger',
                    timeout: 2000
                });
            });
    }
}]);
