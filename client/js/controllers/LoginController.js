var kitso = angular.module('kitso');

kitso.controller('LoginController', ['$scope', '$location', '$timeout', '$routeParams', 'AuthService', 'UserService', function($scope, $location, $timeout, $routeParams, AuthService, UserService) {

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
                        $location.path('/home');
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
    $scope.newPassword = '';
    $scope.recover = false;

    $scope.recoverPassword = function() {
        $scope.recover = true;
        UserService.findByEmail({ email: $scope.recoverEmailAddress })
            .then((user) => {
                var updatedUser = {
                    _id: user._id,
                    new_password: $scope.newPassword
                };
                UserService.editUser(updatedUser);
                UserService.sendPasswordRecoverEmail({ email: $scope.recoverEmailAddress })
                    .then(() => {
                        UIkit.notification({
                            message: '<span uk-icon=\'icon: check\'></span> Recover email sent. Please verify your email.',
                            status: 'success',
                            timeout: 2000
                        });
                        $scope.recover = false;
                        UIkit.modal('#my-id').hide();
                    })
                    .catch((error) => {
                        UIkit.notification({
                            message: '<span uk-icon=\'icon: check\'></span> ' + error,
                            status: 'danger',
                            timeout: 2000
                        });
                        $scope.recover = false;
                    });
            })
            .catch((error) => {
                UIkit.notification({
                    message: '<span uk-icon=\'icon: check\'></span> ' + error,
                    status: 'danger',
                    timeout: 2000
                });
                $scope.recover = false;
            });
    }

    $scope.passwordUpdated = 0;

    $scope.updatePassword = function() {
        UserService.updateUserPassword($routeParams.email)
            .then((result) => {
                $scope.passwordUpdated = 1;
                $timeout(function() {
                    $location.path('/login');
                    }, 5000);
            })
            .catch((error) => {
                $scope.passwordUpdated = 2;
                UIkit.notification({
                    message: '<span uk-icon=\'icon: check\'></span> ' + error,
                    status: 'danger',
                    timeout: 3000
                });
                $timeout(function() {
                    $location.path('/login');
                    }, 5000);
            });
    }
}]);
