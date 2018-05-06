var kitso = angular.module('kitso', ['ngRoute', 'appRoutes']);
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
        // user home
        .when('/home', {
            templateUrl: 'views/userHome.html',
            controller: 'HomeController',
            access: {restricted: true}
        })
        .otherwise({
          redirectTo: '/'
        });

    $locationProvider.html5Mode(true);

}]);

kitso.run(function ($rootScope, $location, $route, AuthService) {
  $rootScope.$on('$routeChangeStart',
    function (event, next, current) {
      AuthService.getStatus()
      .then(function(){
        if ((next.acess == null || next.access.restricted) && !AuthService.isLogged()){
          $location.path('/login');
          $route.reload();
        }
      });
  });
});
