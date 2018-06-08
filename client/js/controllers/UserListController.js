var kitso = angular.module('kitso');

kitso.controller('UserListController',
['$scope', '$location', '$timeout', 'UserListService', 'MovieService','$routeParams', 'AuthService',
function($scope, $location, $timeout, UserListService, MovieService, $routeParams, AuthService) {
  UserListService.loadUserList($routeParams.userlist_id).then(() => {
    $scope.userlist = UserListService.getUserList();
    loadUserListBackground();
  }).catch((error) => {
      UIkit.notification({
          message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
          status: 'danger',
          timeout: 2500
      });
  });

  $scope.getPoster = function(media){
    if (media.poster_path){
      return media.poster_path;
    }
    if(media.images && media.images.poster){
      return media.images.poster;
    }
    if(media.helper && media.helper.poster_path){
      return 'https://image.tmdb.org/t/p/w500/' + media.helper.poster_path;
    }
  }

  function isMovie(media) {
    return media.__t === "Movie";
  }

  var loadUserListBackground = function () {
    var addedMovies = [];
    $scope.userlist.itens.forEach((item) => {
      addedMovies.push(item._media);
    });

    if (addedMovies.length > 0) {
      $scope.background = "https://image.tmdb.org/t/p/original/" + addedMovies[0]._media.helper.backdrop_path;
    } else {
      $scope.background = "/images/strange.jpg";
    }
  }
}]);
