var kitso = angular.module('kitso');

kitso.controller('HomeController', ['$scope', '$location', '$timeout', 'AuthService', function($scope, $location, $timeout, AuthService) {

	$scope.logout = function() {
		AuthService.logout()
                // handle success
                .then(function () {
                    UIkit.notification({
                        message: '<span uk-icon=\'icon: check\'></span> Logged out! Redirecting...',
                        status: 'success',
                        timeout: 1500
                    });

                    $timeout(function() {
                        $location.path('/');
                        }, 1500);
                })
                // handle error
                .catch(function (error) {
                	console.log(error);
                    var dangerMessage = "Something went wrong...";

                    UIkit.notification({
                        message: '<span uk-icon=\'icon: check\'></span> ' + dangerMessage,
                        status: 'danger',
                        timeout: 2500
                    });
                });
	};

	$scope.isLogged = function() {
		return AuthService.isLogged();
	}
}]);
