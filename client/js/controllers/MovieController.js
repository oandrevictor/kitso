var kitso = angular.module('kitso');

kitso.controller('MovieController',
['$scope', '$location', '$timeout', 'MovieService', 'WatchedService', 'RatedService', '$routeParams', 'AuthService',
function($scope, $location, $timeout, MovieService, WatchedService, RatedService, $routeParams, AuthService) {

    MovieService.loadMovie($routeParams.movie_id)
        .then(() => {
          AuthService.getStatus().then(function(){
            $scope.user = AuthService.getUser();
            $scope.movie = MovieService.getMovie();
            $scope.release_date_formated = moment($scope.movie.release_date).format('YYYY');
            $scope.updateRating(0);
            RatedService.isRated($scope.user._id ,$routeParams.movie_id).then((rated) => {
                $scope.movie.rated = rated;
                if (! rated.rated_id){
                  $scope.movie.rated = false;
                  $scope.updateRating(0);
                }else{
                  RatedService.getAllRated($scope.user._id).then((all) => {
                    for (var i = 0; i < all.length; i++) {
                      if(all[i]._id === $scope.movie.rated.rated_id){
                        $scope.updateRating(all[i].rating);
                      }
                    }
                  }).catch((error) => {
                    UIkit.notification({
                        message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                        status: 'danger',
                        timeout: 2500
                    });
                  })
                }
            }).catch((error) => {
              UIkit.notification({
                  message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                  status: 'danger',
                  timeout: 2500
              });
            });
            WatchedService.isWatched($scope.user._id ,$routeParams.movie_id).then((watched) => {
                $scope.movie.watched = watched;
                if (! watched.watched_id)
                  $scope.movie.watched = false;
            }).catch((error) => {
              UIkit.notification({
                  message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                  status: 'danger',
                  timeout: 2500
              });
            });

          }).catch(function(){

          })


        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });

    $scope.markAsWatched = function(movieId){
        WatchedService.markAsWatched($scope.user._id, movieId)
        .then((watched) => {
            $scope.movie.watched = watched;
        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });
    }

    $scope.markAsNotWatched = function(watchedId){
        WatchedService.markAsNotWatched(watchedId)
        .then(() => {
            $scope.movie.watched = false;
            $scope.movie.rating = 0;
        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });
    }

  $scope.editionMode = function () {
    $location.path('movie/edit/' + $routeParams.movie_id);
  }

  $scope.rate = function(movieId, rating){
    if ($scope.movie.rated) {
        if (rating !== $scope.movie.rating) {
          $scope.markAsNotRated($scope.movie.rated.rated_id);
          $scope.markAsRated(movieId, rating);
          $scope.updateRating(rating);
          UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> Rating edited!',
            status: 'success',
            timeout: 1500
          });
        } else {
          $scope.markAsNotRated($scope.movie.rated.rated_id);
          $scope.updateRating(0);
          UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> Rating removed!',
            status: 'warning',
            timeout: 1500
          });
        }
        
    } else {
        $scope.markAsRated(movieId, rating);
        $scope.updateRating(rating);
        UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> Rated!',
            status: 'success',
            timeout: 1500
        });
    }
  }

  $scope.markAsRated = function(movieId, rating) {
    RatedService.markAsRated($scope.user._id, movieId, date = moment(), rating)
    .then((rated) => {
        $scope.movie.rated = rated;
    })
    .catch((error) => {
        UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
            status: 'danger',
            timeout: 2500
        });
    });
    }

    $scope.markAsNotRated = function(ratedId){
        RatedService.markAsNotRated(ratedId)
        .then(() => {
            $scope.movie.rated = false;
        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });
    }

    $scope.updateRating = function(rating){
      $scope.movie.rating = rating;
    }


    $scope.range = function(count){
        var ratings = [];
        for (var i = 0; i < count; i++) {
            ratings.push(i+1)
        }
        return ratings;
    }

}]);
