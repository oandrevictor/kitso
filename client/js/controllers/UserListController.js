var kitso = angular.module('kitso');

kitso.controller('UserListController',
['$scope', '$location', '$timeout', 'UserListService', 'MovieService','$routeParams', 'AuthService',
function($scope, $location, $timeout, UserListService, MovieService, $routeParams, AuthService) {
  AuthService.getStatus().then(function () {
    $scope.user = AuthService.getUser();
    loadUserList();
  })
    .catch((error) => {
      UIkit.notification({
        message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
        status: 'danger',
        timeout: 2500
      });
    });

  var loadUserList = function () {
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
  };

  $scope.goToMedia = function (media) {
    if (media.__t === 'TvShow') {
      $location.path('tvshow/' + media._id);
    } else if (media.__t === "Movie") {
      $location.path('movie/' + media._id);
    } else if (media.__t === "Episode"){
      $location.path('tvshow/' + media._tvshow_id + '/season/'+ media.season_number);
    }

  }

  $scope.getPoster = function(media){
    var img_path;

    if (media.__t === 'Episode') {
      img_path = media.still_path;
    } else {
      img_path = media.poster_path;
    }
    return 'https://image.tmdb.org/t/p/w500/' + img_path;
  }

  $scope.removeFromList = function(userListId, ranked) {
    UserListService.deleteItem(userListId, $scope.user._id, ranked)
      .then((deleted) => {
        loadUserList();
        UIkit.notification({
          message: '<span uk-icon=\'icon: check\'></span> Removed!',
          status: 'success',
          timeout: 1500
        });
      })
      .catch((error) => {
        UIkit.notification({
          message: '<span uk-icon=\'icon: check\'></span> ' + error,
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

  $scope.formatDate = function (date) {
    return moment(date).format('DD/MM/YYYY')
  };

  $scope.optionToggle = function () {
    if ($scope.showChangeOptions) {
      $scope.showChangeOptions = false;
    } else {
      $scope.showChangeOptions = true;
    }
  }

  $scope.changeOrder = function (userListId, currentRank, newRank) {
    UserListService.updateRank(userListId, $scope.user._id, currentRank, newRank)
      .then((list) => {
        loadUserList();
      })
      .catch((error) => {
        UIkit.notification({
          message: '<span uk-icon=\'icon: check\'></span> ' + error,
          status: 'danger',
          timeout: 2500
        });
      });
    ;
  }

  $scope.rankDown = function(ranked, max) {
    if (ranked + 1 < max) {
      return ranked + 1;
    } return ranked;
  }

  $scope.rankUp = function (ranked) {
    if ((ranked - 1) > 0) {
      return ranked - 1;
    } return ranked;
  }

  $scope.followList = function (userlist) {
    UserListService.followUserList(userlist)
      .then((response) => {
        console.log('lala', response);
      })
      .catch((error) => {
        UIkit.notification({
          message: '<span uk-icon=\'icon: check\'></span> ' + error,
          status: 'danger',
          timeout: 2500
        });
      });
    ;
  }

  $scope.unfollowList = function (userlist) {
    UserListService.unfollowUserList(userlist)
      .then((response) => {
        console.log('lala', response);
      })
      .catch((error) => {
        UIkit.notification({
          message: '<span uk-icon=\'icon: check\'></span> ' + error,
          status: 'danger',
          timeout: 2500
        });
      });
    ;
  }

  $scope.canEdit = function(user, userlist){
    if (user !== undefined && userlist !== undefined) {
      return (user._id.toString() === userlist._user.toString());
    }
  }

  $scope.editionMode = function () {
    $location.path('user/list/edit/' + $scope.userlist._id);
  }

  $scope.goToProfile = function () {
    $location.path('profile');
  }
}]);
