var kitso = angular.module('kitso');

kitso.controller('LoginController', function($scope) {
    $scope.submitForm = function() {

        if ($scope.userForm.$valid) {
            // SUBMITE REQUEST HERE
            alert('form submited');
        }
    };

    $scope.isInvalid = function (field) {
        return (field.$invalid && !field.$pristine);
    };

    $scope.resetValidity = function () {
        if ($scope.userForm.$submitted) {
            $scope.userForm.password.$setValidity('password', true);
        }
    }
});
