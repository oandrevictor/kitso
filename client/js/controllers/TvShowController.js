var kitso = angular.module('kitso');

kitso.controller("TvShowController", ['$scope', '$location', '$timeout', '$routeParams', 'TvShowService',  'WatchedService',  'FollowService', 'AuthService', function($scope, $location, $timeout, $routeParams, TvShowService,  WatchedService, FollowService, AuthService) {
    $scope.user = AuthService.getUser();
    TvShowService.loadTvShow($routeParams.tvshow_id)
        .then(() => {
          AuthService.getStatus().then(function(){
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

            FollowService.isFollowingPage($scope.user._id ,$routeParams.tvshow_id).then((followed) => {
              $scope.tvshow.followed = followed;
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


    $scope.follow = function(tvshowId){
        FollowService.followPage($scope.user._id, tvshowId)
        .then((followed) => {
            $scope.tvshow.followed = followed;
            $scope.tvshow.followed.following_id = followed._id;
            $scope.tvshow.followed.is_following = true;

        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });
    };

    $scope.unfollow = function(tvshow){
      var followId = tvshow.followed.following_id;
        FollowService.unfollowPage(followId)
        .then((followed) => {
            $scope.tvshow.followed = false;
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

}]);
