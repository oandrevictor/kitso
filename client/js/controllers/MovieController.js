var kitso = angular.module('kitso');

kitso.controller('MovieController', ['$scope', '$location', '$timeout', 'MovieService', 'WatchedService', '$routeParams', function($scope, $location, $timeout, MovieService, WatchedService, $routeParams) {
    $scope.user = AuthService.getUser();
    var isWatched = false;

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

    WatchedService.isWatched($scope.user._id, $routeParams.movie_id)
        .then(() => {
            this.isWatched = WatchedService.getIsWatched();
        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });

    var onChangeWatched = function() {
      if (this.isWatched) {
        this.markAsNotWatched;
      } else {
        this.markAsWatched;
      }
    }

    var markAsWatched = function(){
        WatchedService.markAsWatched($scope.user._id, $routeParams.movie_id)
        .then(() => {
            this.isWatched = true;
        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });
    }

    var markAsNotWatched = function(){
        WatchedService.markAsNotWatched($routeParams.movie_id)
        .then(() => {
            this.isWatched = false;
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
