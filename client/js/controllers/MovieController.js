var kitso = angular.module('kitso');

kitso.controller('MovieController', ['$scope', '$location', '$timeout', 'MovieService','$routeParams', function($scope, $location, $timeout, MovieService, $routeParams) {
  MovieService.loadMovie($routeParams.movie_id)
        .then(() => {
            $scope.movie = MovieService.getTvShow();
        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });
}]);
