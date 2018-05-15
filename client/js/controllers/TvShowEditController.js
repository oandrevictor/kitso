var kitso = angular.module('kitso');

kitso.controller('TvShowEditController', ['$scope', '$location', '$timeout', 'TvShowService','$routeParams', function($scope, $location, $timeout, TvShowService, $routeParams) {
  TvShowService.loadTvShow($routeParams.tvshow_id)
        .then(() => {
            $scope.tvshow = TvShowService.getTvShow();
            $scope.tvshow.release_date = new Date(moment($scope.tvshow.release_date).format('YYYY/MM/DD'));
        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });

  $scope.saveTvShow = function () {
    TvShowService.updateTvShow($scope.tvshow)
    .then(() => {
        $location.path('tvshow/' + $routeParams.tvshow_id);
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
