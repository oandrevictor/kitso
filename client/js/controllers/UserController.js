var kitso = angular.module('kitso');

kitso.controller('UserController',
['$scope', '$location', '$timeout', 'MovieService', 'WatchedService', 'FollowService', '$routeParams', 'AuthService', 'UserService',
function($scope, $location, $timeout, MovieService, WatchedService,  FollowService, $routeParams, AuthService, UserService) {


    AuthService.getStatus().then(function(){
      $scope.logged_user = AuthService.getUser();
      UserService.getUser($routeParams.user_id).then((user)=> {
        $scope.user = user;
        FollowService.isFollowingUser($scope.logged_user._id, $scope.user._id).then((followed) => {
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


    $scope.canEdit = function(user){
      if (!$scope.user || !$scope.logged_user)
        return false;
      else
        return ($scope.user._id === $scope.logged_user._id);
    }

    $scope.follow = function(user){
      userId = user._id;
        FollowService.followUser($scope.logged_user._id, userId)
        .then((followed) => {
            user.followed = followed;
            user.followed.following_id = followed._id;
            user.followed.is_following = true;
        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });
    };

    $scope.unfollow = function(user){
      var followId = user.followed.following_id;
        FollowService.unfollowUser(followId)
        .then((followed) => {
            user.followed = false;
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
