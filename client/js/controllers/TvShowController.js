var kitso = angular.module('kitso');

kitso.controller("TvShowController",
['$scope', '$location', '$timeout', '$routeParams', 'TvShowService',  'WatchedService', 'RatedService', 'AuthService',
function($scope, $location, $timeout, $routeParams, TvShowService, WatchedService, RatedService, AuthService) {
    $scope.user = AuthService.getUser();
    TvShowService.loadTvShow($routeParams.tvshow_id)
        .then(() => {
            $scope.tvshow = TvShowService.getTvShow();
            WatchedService.isWatched($scope.user._id ,$routeParams.tvshow_id).then((watched) => {
                $scope.tvshow.watched = watched;
                if (! watched.watched_id)
                  $scope.tvshow.watched = false;
            }).catch((error) => {
              UIkit.notification({
                  message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                  status: 'danger',
                  timeout: 2500
              });
            });
            RatedService.isRated($scope.user._id ,$routeParams.tvshow_id).then((rated) => {
                $scope.tvshow.rated = rated;
                if (! rated.rated_id){
                  $scope.tvshow.rated = false;
                  $scope.updateRating(0);
                }else{
                  RatedService.getAllRated($scope.user._id).then((all) => {
                    for (var i = 0; i < all.length; i++) {
                      if(all[i]._id === $scope.tvshow.rated.rated_id){
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
        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });


    $scope.markAsWatched = function(tvshowId){
        WatchedService.markAsWatched($scope.user._id, tvshowId)
        .then((watched) => {
            $scope.tvshow.watched = watched;
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
            $scope.tvshow.watched = false;
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
        $location.path('tvshow/edit/' + $routeParams.tvshow_id);
    }

    $scope.rate = function(tvshowId, rating){
      if ($scope.tvshow.rated) {
          if (rating !== $scope.tvshow.rating) {
            $scope.markAsNotRated($scope.tvshow.rated.rated_id);
            $scope.markAsRated(tvshowId, rating);
            $scope.updateRating(rating);
          } else {
            $scope.markAsNotRated($scope.tvshow.rated.rated_id);
            $scope.updateRating(0);
          }
          UIkit.notification({
                          message: '<span uk-icon=\'icon: check\'></span> Rating edited!',
                          status: 'success',
                          timeout: 1500
                      });
      } else {
          $scope.markAsRated(tvshowId, rating);
          $scope.updateRating(rating);
          UIkit.notification({
                          message: '<span uk-icon=\'icon: check\'></span> Rated!',
                          status: 'success',
                          timeout: 1500
                      });
      }
    }

  $scope.markAsRated = function(tvshowId, rating) {
    $scope.tvshow.rating = rating;
    RatedService.markAsRated($scope.user._id, tvshowId, date = moment(), rating)
    .then((rated) => {
        $scope.tvshow.rated = rated;
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
            $scope.tvshow.rated = false;
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
      $scope.tvshow.rating = rating;
    }

    $scope.range = function(count){
        var ratings = [];
        for (var i = 0; i < count; i++) {
            ratings.push(i+1)
        }
        return ratings;
    }

}]);
