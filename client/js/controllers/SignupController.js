var kitso = angular.module('kitso');

kitso.controller('SignupController', function($scope) {
    $scope.submitForm = function() {
        this.checkPassword();

        if ($scope.userForm.$valid) {
            var user = {
                name: userForm.name,
                username: userForm.userForm,
                email: userForm.email,
                password: userForm.password,
                conf_pass: userForm.passwordConfirmation,
                birthday: userForm.birthday,
                gender: userForm.gender
            }

            AuthService.register(user)
                // handle success
                .then(function () {
                    alert('User successfully registred.');
                })
                // handle error
                .catch(function () {
                    alert('Something went wrong.');
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
