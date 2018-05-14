var kitso = angular.module('kitso');

kitso.controller('MovieController', ['$scope', '$location', '$timeout', 'MovieService','$routeParams', function($scope, $location, $timeout, MovieService, $routeParams) {
  MovieService.loadMovie($routeParams.movie_id)
        .then(() => {
            $scope.movie = MovieService.getMovie();
            $scope.release_date_formated = moment($scope.release_date).format('DD/MM/YYYY');
        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });

  var markAsWatched = function(){
    // Enviar chamada para WatchedService
    // Watched Service deve chamar a rota backend
  }

  $scope.editionMode = function () {
    $location.path('movie/edit/' + $routeParams.movie_id);
  }

}]);
