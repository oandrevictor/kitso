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
        // Password Recover page
        .when('/passwordRecover/:email', {
            templateUrl: 'views/passwordRecover.html',
            controller: 'LoginController',
            access: { restricted: false }
        })
        // user home page
        .when('/home', {
            templateUrl: 'views/userHome.html',
            controller: 'HomeController',
            access: { restricted: true }
        })
        //exploring
        .when('/explore', {
            templateUrl: 'views/explore.html',
            controller: 'ExploreController',
            access: { restricted: true }
        })
        // profile page
        .when('/profile', {
            templateUrl: 'views/profile.html',
            controller: 'ProfileController',
            access: { restricted: true }
        })
        .when('/user/:user_id', {
            templateUrl: 'views/profile.html',
            controller: 'ProfileController',
            access: { restricted: true }
        })
        .when('/tvshow/:tvshow_id', {
            templateUrl: 'views/tvshow.html',
            controller: 'TvShowController',
            access: { restricted: true }
        })
        .when('/tvshow/:tvshow_id/season/:season', {
            templateUrl: 'views/season.html',
            controller: 'SeasonController',
            access: { restricted: true }
        })
        .when('/tvshow/edit/:tvshow_id', {
            templateUrl: 'views/tvshow-edit.html',
            controller: 'TvShowEditController',
            access: { restricted: true }
        })
        // movie page
        .when('/movie/:movie_id', {
            templateUrl: 'views/movie.html',
            controller: 'MovieController',
            access: { restricted: true }
        })
        .when('/movie/edit/:movie_id', {
            templateUrl: 'views/movie-edit.html',
            controller: 'MovieEditController',
            access: { restricted: true }
        })
        // person page
        .when('/person/:person_id', {
            templateUrl: 'views/person.html',
            controller: 'PersonController',
            access: { restricted: true }
        })
        .when('/person/edit/:person_id', {
            templateUrl: 'views/person-edit.html',
            controller: 'PersonEditController',
            access: { restricted: true }
        })
        .otherwise({
          redirectTo: '/'
        });

    $locationProvider.html5Mode(true);

}]);

angular.module('kitso').run(function ($rootScope, $location, $route, AuthService) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      $('.full-loading').show();
        AuthService.getStatus()
        .then(() => {
          $('.full-loading').hide();
            if (next.access.restricted && !AuthService.isLogged()) {
                $location.path('/login');
                UIkit.notification({
                    message: '<span uk-icon=\'icon: check\'></span> You need to be logged in to access this page',
                    status: 'warning',
                    timeout: 2500
                });
                $route.reload();
            } else if (!next.access.restricted && AuthService.isLogged()) {
                $location.path('/profile');
                $route.reload();
            }
        });
    });
});
