var kitso = angular.module('kitso');

kitso.controller('UserListController',
['$scope', '$location', '$timeout', 'UserListService', 'MovieService','$routeParams', 'AuthService',
function($scope, $location, $timeout, UserListService, MovieService, $routeParams, AuthService) {
  $('.full-loading').show();
    UserListService.loadUserList($routeParams.userlist_id)
        .then(() => {
          AuthService.getStatus().then(function(){
            $scope.user = AuthService.getUser();
            $scope.userlist = UserListService.getUserList();
    
            $('.full-loading').hide();

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

    $scope.follow = function(movie){
        FollowService.followPage($scope.user._id, movie)
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

  $scope.rate = function(movieId, rating){
    if ($scope.movie.rated) {
        if (rating !== $scope.movie.rating) {
          $scope.updateRated($scope.movie.rated.rated_id, rating);
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

    $scope.updateRated = function (ratedId, rating){
      var ratedObj = {
          "date" : date = moment(),
          "rating" : rating,
          "_id" : ratedId
      };
      RatedService.updateRated(ratedObj);
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
