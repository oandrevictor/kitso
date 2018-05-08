angular.module('kitso', ['ngRoute', 'appRoutes']);
angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $routeProvider

        // home page
        .when('/', {
            templateUrl: 'views/home.html',
            controller: 'MainController',
            access: { restricted: false }
        })
        // signup page
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
        // user home page
        .when('/home', {
            templateUrl: 'views/userHome.html',
            controller: 'HomeController',
            access: { restricted: true }
        })
        // profile page
        .when('/profile', {
            templateUrl: 'views/profile.html',
            controller: 'ProfileController',
            access: { restricted: true }
        })
        .otherwise({
          redirectTo: '/'
        });

    $locationProvider.html5Mode(true);

}]);

angular.module('kitso').run(function ($rootScope, $location, $route, AuthService) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        AuthService.getStatus()
        .then(() => {
            if (next.access.restricted && !AuthService.isLogged()) {
                $location.path('/login');
                UIkit.notification({
                    message: '<span uk-icon=\'icon: check\'></span> You need to be logged in to access this page',
                    status: 'warning',
                    timeout: 2500
                });
                $route.reload();
            }
        });
    });
});