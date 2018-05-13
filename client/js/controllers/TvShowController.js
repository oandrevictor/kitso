var kitso = angular.module('kitso');

kitso.controller("TvShowController", ['$scope', '$routeParams', 'TvShowService', function($scope, $routeParams, TvShowService) {
    TvShowService.loadTvShow($routeParams.tvshow_id)
        .then(() => {
            $scope.tvshow = TvShowService.getTvShow();
        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });

}]);