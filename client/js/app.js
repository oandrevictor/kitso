angular.module('savetv', ['ngRoute', 'appRoutes', 'MainController', 'LoginController']);

angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $routeProvider

        // home page
        .when('/', {
            templateUrl: 'views/home.html',
            controller: 'MainController'
        })

        // login page
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'LoginController'
        })

    $locationProvider.html5Mode(true);

}]);
