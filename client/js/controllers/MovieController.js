var kitso = angular.module('kitso');

kitso.controller('MovieController',
['$scope', '$location', '$timeout', 'MovieService', 'WatchedService', 'FollowService', '$routeParams', 'AuthService',
function($scope, $location, $timeout, MovieService, WatchedService,  FollowService, $routeParams, AuthService) {

    MovieService.loadMovie($routeParams.movie_id)
        .then(() => {
          AuthService.getStatus().then(function(){
            $scope.user = AuthService.getUser();
            $scope.movie = MovieService.getMovie();
            $scope.release_date_formated = moment($scope.movie.release_date).format('YYYY');
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

            FollowService.isFollowingPage($scope.user._id ,$routeParams.movie_id).then((followed) => {
              $scope.movie.followed = followed;
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

    $scope.follow = function(movieId){
        FollowService.followPage($scope.user._id, movieId)
        .then((followed) => {
            $scope.movie.followed = followed;
            $scope.movie.followed.following_id = followed._id;
            $scope.movie.followed.is_following = true;

        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });
    };

    $scope.unfollow = function(movie){
      var followId = movie.followed.following_id;
        FollowService.unfollowPage(followId)
        .then((followed) => {
            $scope.movie.followed = false;
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

}]);
