angular.module('kitso', ['ngRoute', 'appRoutes']);
angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $routeProvider

        // home page
        .when('/', {
            templateUrl: 'views/home.html',
            controller: 'MainController',
            access: { restricted: false }
        })
        .when('/signup', {
            templateUrl: 'views/signup.html',
            controller: 'SignupController',
            access: { restricted: false }
        })
        // login page
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'LoginController',
            access: { restricted: false }
        })
        // user home
        .when('/home', {
            templateUrl: 'views/userHome.html',
            controller: 'HomeController',
            access: { restricted: true }
        })
        .otherwise({
          redirectTo: '/'
        });

    $locationProvider.html5Mode(true);

}]);