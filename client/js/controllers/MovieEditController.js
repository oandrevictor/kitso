var kitso = angular.module('kitso');

kitso.controller('MovieEditController', ['$scope', '$location', '$timeout', 'MovieService','$routeParams', function($scope, $location, $timeout, MovieService, $routeParams) {
  MovieService.loadMovie($routeParams.movie_id)
        .then(() => {
            $scope.movie = MovieService.getMovie();
            $scope.movie.release_date = new Date(moment($scope.movie.release_date).format('YYYY/MM/DD'));
        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });

  $scope.saveMovie = function () {
    MovieService.updateMovie($scope.movie)
    .then(() => {
        $location.path('movie/' + $routeParams.movie_id);
    })
    .catch((error) => {
        UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
            status: 'danger',
            timeout: 2500
        });
    });
  }

}]);
