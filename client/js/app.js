angular.module('kitso', ['ngRoute', 'appRoutes']);
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
        // login page
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'LoginController'
        })

    $locationProvider.html5Mode(true);

}]);
