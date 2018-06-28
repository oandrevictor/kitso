var kitso = angular.module('kitso');

kitso.controller('UserListEditController', ['$scope', '$location', '$timeout', 'UserListService','$routeParams', function($scope, $location, $timeout, UserListService, $routeParams) {
  UserListService.loadUserList($routeParams.userlist_id)
    .then(() => {
      $scope.userlist = UserListService.getUserList();
      $scope.title = $scope.userlist.title;
      loadUserListBackground();
    })
    .catch((error) => {
      UIkit.notification({
        message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
        status: 'danger',
        timeout: 2500
      });
    });

  $scope.isInvalid = function (field) {
    return (field.$invalid && !field.$pristine);
  };

  $scope.saveUserList = function () {
    UserListService.updateUserList($scope.userlist)
      .then(() => {
        $location.path('user/list/' + $routeParams.userlist_id);
      })
      .catch((error) => {
        UIkit.notification({
          message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
          status: 'danger',
          timeout: 2500
        });
      });
  }

  var loadUserListBackground = function () {
    var addedMovies = [];
    $scope.userlist.itens.forEach((item) => {
      addedMovies.push(item._media);
    });

    if (addedMovies.length > 0) {
      var img_path;
      var first_media = addedMovies[0];

      if (first_media.__t === 'Episode') {
        img_path = first_media.still_path;
      } else {
        img_path = first_media.poster_path;
      }
      $scope.background = 'https://image.tmdb.org/t/p/w500/' + img_path;
    } else {
      $scope.background = '/images/coco.jpg';
    }
  }
}]);
