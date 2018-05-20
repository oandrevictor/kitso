var kitso = angular.module('kitso');

kitso.controller('UserController',
['$scope', '$location', '$timeout', 'MovieService', 'WatchedService', 'FollowService', '$routeParams', 'AuthService', 'UserService',
function($scope, $location, $timeout, MovieService, WatchedService,  FollowService, $routeParams, AuthService, UserService) {


    AuthService.getStatus().then(function(){
      $scope.logged_user = AuthService.getUser();
      UserService.getUser($routeParams.user_id).then((user)=> {
        $scope.user = user;
        FollowService.isFollowingUser($scope.logged_user._id, $routeParams.user_id).then((followed) => {
          $scope.user.followed = followed;
        }).catch((error) => {
          console.log(error)
          UIkit.notification({
              message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
              status: 'danger',
              timeout: 2500
          });
        })
      }).catch((error)=>{
        console.log(error)
        console.log("Couldnt fetch page user")
      })
    }).catch(function(){
      console.log("Couldnt fetch current logged user")
    })


    $scope.canEdit = function(){
      return $scope.user._id == $scope.logged_user.id;
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
