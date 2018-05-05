var kitso = angular.module('kitso');

kitso.controller('SignupController', ['$scope', '$location', '$timeout', 'AuthService', function($scope, $location, $timeout, AuthService) {
    $scope.submitForm = function() {
        this.checkPassword();

        if ($scope.userForm.$valid) {
            var user = {
                name: $scope.userForm.name.$modelValue,
                username: $scope.userForm.username.$modelValue,
                email: $scope.userForm.email.$modelValue,
                password: $scope.userForm.password.$modelValue,
                conf_pass: $scope.userForm.passwordConfirmation.$modelValue,
                birthday: $scope.userForm.birthday.$modelValue,
                gender: $scope.userForm.gender.$modelValue
            }
            
            AuthService.register(user)
                // handle success
                .then(function () {
                    UIkit.notification({
                        message: '<span uk-icon=\'icon: check\'></span> Registred! Redirecting...',
                        status: 'success',
                        timeout: 1500
                    });

                    $timeout(function() {
                        $location.path('/login');
                        }, 1500);

                })
                // handle error
                .catch(function (error) {
                    var dangerMessage = 'Something went wrong...';

                    if (error.code == 11000) {

                        if (error.errmsg.includes('username_1')) {
                            dangerMessage = 'Username already in use';
                        } else if (error.errmsg.includes('email_1')) {
                            dangerMessage = 'Email already in use';
                        }

                        UIkit.notification({
                            message: '<span uk-icon=\'icon: check\'></span> ' + dangerMessage,
                            status: 'danger',
                            timeout: 2500
                        });
                    } else {
                        UIkit.notification({
                            message: '<span uk-icon=\'icon: check\'></span> ' + dangerMessage,
                            status: 'danger',
                            timeout: 2500
                        });
                    }
                });
            
        }
    };

    $scope.isInvalid = function (field) {
        return (field.$invalid && !field.$pristine);
    };

    $scope.checkPassword = function () {
        var password = $scope.userForm.password.$modelValue;
        var passwordConfirmation = $scope.userForm.passwordConfirmation.$modelValue;

        if (password !== passwordConfirmation) {
            $scope.userForm.password.$setValidity('password', false);
            $scope.userForm.passwordConfirmation.$setValidity('passwordConfirmation', false);
        }
    };

    $scope.resetValidity = function () {
        if ($scope.userForm.$submitted) {
            $scope.userForm.password.$setValidity('password', true);
            $scope.userForm.passwordConfirmation.$setValidity('passwordConfirmation', true);
        }
    }
}]);
