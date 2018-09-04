var kitso = angular.module('kitso');

kitso.controller("TvShowController", ['$scope', '$location', '$route', '$timeout', '$routeParams', 'TvShowService',
  'WatchedService',  'FollowService', 'RatedService', 'UserListService', 'AuthService', 'NewsService',
function($scope, $location, $route, $timeout, $routeParams, TvShowService,  WatchedService, FollowService,
         RatedService, UserListService, AuthService, NewsService) {
  $('.full-loading').show();
  $scope.newsbox_toggle = true;

    TvShowService.loadTvShow($routeParams.tvshow_id)
        .then(() => {
          AuthService.getStatus().then(function(){
            $scope.user = AuthService.getUser();
            $scope.tvshow = TvShowService.getTvShow();
            $scope.tvshow.air_date = new Date($scope.tvshow.first_air_date);
            $scope.tvshow.watchedDate = new Date(moment());
            $scope.tvshow.validWatchedDate = true;

            WatchedService.tvshowProgress($scope.user._id ,$scope.tvshow._id)
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

          var lists = [];
          $scope.user._lists.forEach((listId) => {
              UserListService.loadUserList(listId).then( function(){
                var list = UserListService.getUserList();
                list.itens.forEach(function(item){
                  if (item._media._id == $scope.tvshow._id) {
                    list.tvshowAdded = true;
                  }
                })
                lists.push(list);
              }).catch(function(error){
                  console.log(error);
              })
          });
          $scope.user.lists = lists;

          NewsService.getRelatedNews($scope.tvshow._id).then(function(news){
            $scope.news = news;
          });

            RatedService.isRated($scope.user._id ,$scope.tvshow._id).then((rated) => {
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

            RatedService.getVoteAverage($scope.tvshow._id).then((response) => {
              $scope.tvshow.vote_average = response.vote_average;
            }).catch((error) => {
              console.log(error);
            });

            FollowService.isFollowingPage($scope.user._id ,$scope.tvshow._id).then((followed) => {
              $scope.tvshow.followed = followed;
            }).catch((error) => {
              UIkit.notification({
                  message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                  status: 'danger',
                  timeout: 2500
              });
            });

            FollowService.countFollowers($scope.tvshow._id).then((count) => {
              $scope.tvshow.followers = count;
            }).catch((error) => {
              UIkit.notification({
                  message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                  status: 'danger',
                  timeout: 2500
              });
            });
            FollowService.friendsWatchingTvshow($scope.user._id, $scope.getEpisodesIds())
            .then((response) => {
              $scope.friendsWatching  = response;
            })
            .catch((error) => {
                console.log('error', error);
            });

            $('.full-loading').hide();
          }).catch(function(){
          })
        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error,
                status: 'danger',
                timeout: 2500
            });
            $location.path('/explore');
        });

    $scope.markEntireTvshowAsWatched = function (tvshowId, runtime) {
      if($scope.tvshow.watchedTime === 'now') {
        $scope.tvshow.watchedDate = new Date(moment());
      }
      if ($scope.tvshow.watchedDate && $scope.notAFutureDate($scope.tvshow.watchedDate)) {
        $scope.tvshow.validWatchedDate = true;

        $scope.watchAction = true;
        WatchedService.markEntireTvshowAsWatched($scope.user._id, tvshowId, runtime, $scope.tvshow.genres, $scope.tvshow.watchedDate)
          .then((result) => {
            UIkit.modal('#modal-watchTvshow').hide();
            $scope.watchAction = false;
            $route.reload();
          })
          .catch((error) => {
            UIkit.notification({
              message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
              status: 'danger',
              timeout: 2500
            });
          });
      } else {
        $scope.tvshow.validWatchedDate = false;
      }
    };

    $scope.markTvshowAsWatched = function (tvshowId, runtime) {
      if($scope.tvshow.watchedTime === 'now') {
        $scope.tvshow.watchedDate = new Date(moment());
      }
      if ($scope.tvshow.watchedDate && $scope.notAFutureDate($scope.tvshow.watchedDate)) {
        $scope.tvshow.validWatchedDate = true;

        $scope.watchAction = true;
        WatchedService.markTvshowAsWatched($scope.user._id, tvshowId, runtime, $scope.tvshow.watchedDate, $scope.tvshow.genres)
          .then((result) => {
            UIkit.modal('#modal-watchTvshow').hide();
            $scope.watchAction = false;
            $route.reload();
          })
          .catch((error) => {
            UIkit.notification({
              message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
              status: 'danger',
              timeout: 2500
            });
          });
      } else {
        $scope.tvshow.validWatchedDate = false;
      }
    };

    $scope.markTvshowAsNotWatched = function () {
        WatchedService.markTvshowAsNotWatched($scope.tvshow._seasons, $scope.user._id)
            .then((result) => {
                $route.reload();
            })
            .catch((error) => {
                UIkit.notification({
                    message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                    status: 'danger',
                    timeout: 2500
                });
            });
        };


    $scope.notAFutureDate = function(date) {
        return moment(date) <= moment();
    }

    $scope.markAsWatched = function(tvshowId, runtime){
      if($scope.tvshow.watchedTime === 'now') {
        $scope.tvshow.watchedDate = new Date(moment());
      }
      if ($scope.tvshow.watchedDate  && $scope.notAFutureDate($scope.tvshow.watchedDate)) {
        $scope.tvshow.validWatchedDate = true;

        WatchedService.markAsWatched($scope.user._id, tvshowId, runtime, $scope.tvshow.genres, $scope.tvshow.watchedDate)
          .then((watched) => {
            $scope.tvshow.watched = watched;
            UIkit.modal('#modal-watchTvshow').hide();
          })
          .catch((error) => {
            UIkit.notification({
              message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
              status: 'danger',
              timeout: 2500
            });
          });
      } else {
        $scope.tvshow.validWatchedDate = false;
      }
    };

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
        updateAdded(true, userListId);
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
              updateAdded(false, userListId);
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

  var updateAdded = function(added, listId) {
    $scope.user.lists.forEach(function(list){
      if (list._id == listId) {
        list.tvshowAdded = added;
      }
    })
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

    $scope.follow = function(tvshow, is_private){
        FollowService.followPage($scope.user._id, tvshow, is_private)
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
        FollowService.countFollowers($scope.tvshow._id).then((count) => {
          $scope.tvshow.followers = count;
        }).catch((error) => {
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
        FollowService.countFollowers($scope.tvshow._id).then((count) => {
          $scope.tvshow.followers = count;
        }).catch((error) => {
          UIkit.notification({
              message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
              status: 'danger',
              timeout: 2500
          });
        });
    }

    $scope.editionMode = function () {
        $location.path('tvshow/edit/' + $scope.tvshow._id);
    }

    $scope.rate = function(tvshowId, rating){
      if ($scope.tvshow.rated && $scope.tvshow.rating !== 0) {
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
      RatedService.updateRated(ratedObj).then((response) => {
        $scope.updateVoteAverage();
      });
    }

    $scope.updateRating = function(rating){
      $scope.tvshow.rating = rating;
      $scope.updateVoteAverage();
    }

    $scope.range = function(count){
        var ratings = [];
        for (var i = 0; i < count; i++) {
            ratings.push(i+1)
        }
        return ratings;
    }

    $scope.getEpisodesIds = function() {
        var seasonsIds = [];
        var seasons = [];
        var episodesIds = [];
        $scope.tvshow._seasons.forEach((season) => {
            if (!seasonsIds.includes(season._id)) {
                seasons.push(season);
                seasonsIds.push(season._id);
            };
        });

        seasons.forEach((season) => {
            let epiIds = season._episodes;
            epiIds = Array.from(new Set(epiIds));
            episodesIds.push(epiIds);
        });

        return episodesIds;
    }

    $scope.updateVoteAverage = function() {
      RatedService.getVoteAverage($scope.tvshow._id).then((rated) => {
        $scope.tvshow.vote_average = rated.vote_average;
      }).catch((error) => {
        console.log(error);
      });
    }

    $scope.updateTvShowInfo = function(tvshowId) {
      TvShowService.updateTvShowInfo(tvshowId)
        .then((response) => {
          $scope.tvshow.updatingInfo = true;
        })
        .catch((error) => {
        });
    }

}]);
