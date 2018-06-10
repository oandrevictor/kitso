var kitso = angular.module('kitso');

kitso.controller("TvShowController", ['$scope', '$location', '$timeout', '$routeParams', 'TvShowService',  'WatchedService',  'FollowService', 'RatedService', 'UserListService', 'AuthService',
function($scope, $location, $timeout, $routeParams, TvShowService,  WatchedService, FollowService, RatedService, UserListService, AuthService) {
  $('.full-loading').show();

    TvShowService.loadTvShow($routeParams.tvshow_id)
        .then(() => {
          AuthService.getStatus().then(function(){
            $scope.user = AuthService.getUser();
            $scope.tvshow = TvShowService.getTvShow();
            $scope.tvshow.air_date = new Date($scope.tvshow.first_air_date);
            $('.full-loading').hide();

            var lists = [];
            $scope.user._lists.forEach((listId) => {
              UserListService.loadUserList(listId).then( function(){
                lists.push(UserListService.getUserList());
              }).catch(function(error){
                console.log(error);
              })
            });
            $scope.user.lists = lists;

            WatchedService.tvshowProgress($scope.user._id ,$routeParams.tvshow_id)
            .then((progress) => {
                if (progress.tvshow.ratio == 1) $scope.tvshow.watched = true;
                else $scope.tvshow.watched = false;
            })
            .catch((error) => {
              UIkit.notification({
                  message: '<span uk-icon=\'icon: check\'></span> ' + "Get progress error.",
                  status: 'danger',
                  timeout: 2500
              });
            });

            RatedService.isRated($scope.user._id ,$routeParams.tvshow_id).then((rated) => {
                $scope.tvshow.rated = rated;
                if (! rated.rated_id){
                  $scope.tvshow.rated = false;
                  $scope.updateRating(0);
                }else{
                  RatedService.getRated($scope.tvshow.rated.rated_id).then((rated) => {
                    $scope.updateRating(rated.rating);
                  }).catch((error) => {
                    UIkit.notification({
                        message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                        status: 'danger',
                        timeout: 2500
                    });
                  })
                }
              }).catch(function(){
                UIkit.notification({
                    message: '<span uk-icon=\'icon: check\'></span> ' + "Get rating error.",
                    status: 'danger',
                    timeout: 2500
                });
              });

              FollowService.isFollowingPage($scope.user._id ,$routeParams.tvshow_id).then((followed) => {
                $scope.tvshow.followed = followed;
            }).catch((error) => {
              UIkit.notification({
                  message: '<span uk-icon=\'icon: check\'></span> ' + "Get followspage error.",
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

    $scope.markEntireTvshowAsWatched = function (tvshowId) {
        $scope.watchAction = true;
        WatchedService.markEntireTvshowAsWatched($scope.user._id, tvshowId)
            .then((result) => {
                $scope.watchAction = false;
                $route.reload();
                UIkit.modal('#modal-watchTvshow').hide();
                console.log(result);
            })
            .catch((error) => {
                UIkit.notification({
                    message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                    status: 'danger',
                    timeout: 2500
                });
            });
        };

    $scope.markTvshowAsWatched = function (tvshowId) {
        $scope.watchAction = true;
        WatchedService.markTvshowAsWatched($scope.user._id, tvshowId)
            .then((result) => {
                $scope.watchAction = false;
                $route.reload();
                UIkit.modal('#modal-watchTvshow').hide();
                console.log(result);
            })
            .catch((error) => {
                UIkit.notification({
                    message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                    status: 'danger',
                    timeout: 2500
                });
            });
        };

    $scope.markTvshowAsNotWatched = function () {
        WatchedService.markTvshowAsNotWatched($scope.tvshow._seasons, $scope.user._id)
            .then((result) => {
                $route.reload();
                console.log(result);
            })
            .catch((error) => {
                UIkit.notification({
                    message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                    status: 'danger',
                    timeout: 2500
                });
            });
        };

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

  $scope.addToList = function(tvshowId, userListId){
    UserListService.addItem(userListId, tvshowId, $scope.user._id, date = moment())
      .then((added) => {
        $scope.tvshowAdded = true;
      })
      .catch((error) => {
        UIkit.notification({
          message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
          status: 'danger',
          timeout: 2500
        });
      });
  }

  $scope.removeFromList = function(tvshowId, userListId) {
    UserListService.loadUserList(userListId).then( function() {
      UserListService.getUserList()['itens'].forEach(function(item){
        if (item['_media']['_id'] == tvshowId) {
          UserListService.deleteItem(userListId, $scope.user._id, item['ranked'])
            .then((deleted) => {
              $scope.tvshowAdded = false;
            })
            .catch((error) => {
              UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
              });
            });
        }
      });
    });
  }

  $scope.markAsAdded = function(tvshowId, userListId) {
    UserListService.loadUserList(userListId).then( function() {
      UserListService.getUserList()['itens'].forEach(function(item){
        if (item['_media']['_id'] == tvshowId) {
          $scope.tvshowAdded = true;
        }
      });
    });
  }

    $scope.follow = function(tvshow){
        FollowService.followPage($scope.user._id, tvshow)
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

    $scope.rate = function(tvshowId, rating){
      if ($scope.tvshow.rated) {
          if (rating !== $scope.tvshow.rating) {
            $scope.updateRated($scope.tvshow.rated.rated_id, rating);
            $scope.updateRating(rating);
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> Rating edited!',
                status: 'success',
                timeout: 1500
            });
          } else {
            $scope.markAsNotRated($scope.tvshow.rated.rated_id);
            $scope.updateRating(0);
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> Rating removed.',
                status: 'warning',
                timeout: 1500
            });
          }
      } else {
          $scope.markAsRated(tvshowId, rating);
          $scope.updateRating(rating);
          UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> Rated!',
                status: 'success',
                timeout: 1500
            });
      }
    }

  $scope.markAsRated = function(tvshowId, rating) {
    $scope.tvshow.rating = rating;
    RatedService.markAsRated($scope.user._id, tvshowId, date = moment(), rating)
    .then((rated) => {
        $scope.tvshow.rated = rated;
    })
    .catch((error) => {
        UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
            status: 'danger',
            timeout: 2500
        });
    });
    }

    $scope.markAsNotRated = function(ratedId){
        RatedService.markAsNotRated(ratedId)
        .then(() => {
            $scope.tvshow.rated = false;
        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });
    }

    $scope.updateRated = function (ratedId, rating){
      var ratedObj = {
          "date" : date = moment(),
          "rating" : rating,
          "_id" : ratedId
      };
      RatedService.updateRated(ratedObj);
    }

    $scope.updateRating = function(rating){
      $scope.tvshow.rating = rating;
    }

    $scope.range = function(count){
        var ratings = [];
        for (var i = 0; i < count; i++) {
            ratings.push(i+1)
        }
        return ratings;
    }

}]);
