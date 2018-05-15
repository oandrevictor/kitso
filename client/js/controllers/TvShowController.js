var kitso = angular.module('kitso');

kitso.controller("TvShowController", ['$scope', '$location', '$timeout', '$routeParams', 'TvShowService', function($scope, $location, $timeout, $routeParams, TvShowService) {
    TvShowService.loadTvShow($routeParams.tvshow_id)
        .then(() => {
            $scope.tvshow = TvShowService.getTvShow();
            console.log($scope.tvshow)
        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });

    $scope.editionMode = function () {
        $location.path('tvshow/edit/' + $routeParams.tvshow_id);
    }

}]);