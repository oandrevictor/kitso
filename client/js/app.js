angular.module('savetv', ['ngRoute', 'appRoutes', 'MainController', 'SignupController']);

angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $routeProvider

        // home page
        .when('/', {
            templateUrl: 'views/home.html',
            controller: 'MainController'
        })

        .when('/signup', {
            templateUrl: 'views/signup.html',
            controller: 'SignupController'
        })

    $locationProvider.html5Mode(true);

}]);
