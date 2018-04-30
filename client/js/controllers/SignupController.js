angular.module('SignupController', []).controller('SignupController', function($scope) {
    $scope.submitForm = function() {
        this.checkPassword();

        if ($scope.userForm.$valid) {
            // SUBMITE REQUEST HERE
            console.log('Submited');
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
});
