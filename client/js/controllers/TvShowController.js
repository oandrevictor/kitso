var kitso = angular.module('kitso');

kitso.controller("TvShowController", ['$scope', '$routeParams', 'TvShowService', 'WatchedService',  'AuthService',
function($scope, $routeParams, TvShowService, WatchedService, AuthService) {
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

}]);
