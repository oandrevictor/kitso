var kitso = angular.module('kitso');

kitso.controller("SeasonController", ['$scope', '$location', '$timeout', '$routeParams', 'TvShowService', 'WatchedService', 'FollowService', 'RatedService', 'UserListService', 'AuthService',
  function ($scope, $location, $timeout, $routeParams, TvShowService, WatchedService, FollowService, RatedService, UserListService, AuthService) {
    $('.full-loading').show();
    TvShowService.loadTvShow($routeParams.tvshow_id).then(() => {
      AuthService.getStatus().then(function () {
        $scope.user = AuthService.getUser();
        $scope.tvshow = TvShowService.getTvShow();

        TvShowService.loadSeason($routeParams.tvshow_id, $routeParams.season)
          .then((season) => {
            $scope.season = season;
            loadEpisodeActions($scope.season);
            $scope.season.episodes.forEach(function (episode) {
              loadEpisodeActions(episode)
            });
            UIkit.modal('#modal-watchSeason').hide();
            $('.full-loading').hide();
            WatchedService.seasonProgress($scope.user._id ,$scope.season._id)
              .then((progress) => {
                $scope.season.progress = progress;
                console.log(progress)
                $scope.updateProgress($scope.season.progress, 0);
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
                lists.push(UserListService.getUserList());
              }).catch(function(error){
                console.log(error);
              })
            });
            $scope.user.lists = lists;
            UserListService.loadUserList($scope.user._watchlist).then( function(){
              $scope.user.watchlist = UserListService.getUserList();
            }).catch(function(error){
              console.log(error);
            });

            FollowService.friendsWatchingTvshow($scope.user._id, $scope.getEpisodesIds())
            .then((response) => {
                $scope.friendsWatching = response;
            })
            .catch((error) => {
                console.log('error', error);
            });
          })
          .catch((error) => {
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
    })
      .catch((error) => {
        UIkit.notification({
          message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
          status: 'danger',
          timeout: 2500
        });
      });

    $scope.addToList = function(id, userListId){
      UserListService.addItem(userListId, id, $scope.user._id, date = moment())
        .then((added) => {
          $scope.seasonAdded = true;
        })
        .catch((error) => {
          UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
            status: 'danger',
            timeout: 2500
          });
        });
    }

    $scope.removeFromList = function(id, userListId) {
      UserListService.loadUserList(userListId).then( function() {
        UserListService.getUserList()['itens'].forEach(function(item){
          if (item['_media']['_id'] == id) {
            UserListService.deleteItem(userListId, $scope.user._id, item['ranked'])
              .then((deleted) => {
                $scope.seasonAdded = false;
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

    $scope.markAsAdded = function(seasonId, userListId) {
      UserListService.loadUserList(userListId).then( function() {
        UserListService.getUserList()['itens'].forEach(function(item){
            if (item['_media']['_id'] == seasonId) {
              $scope.seasonAdded = true;
            }
          }
        );
      });
    }

    var loadEpisodeActions = function (episode) {
      var episodeId = episode._id;

      WatchedService.isWatched($scope.user._id, episodeId).then((watched) => {
        episode.watched = watched;
        if (!watched.watched_id)
          episode.watched = false;
      }).catch((error) => {
        UIkit.notification({
          message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
          status: 'danger',
          timeout: 2500
        });
      });

      RatedService.isRated($scope.user._id, episode._id).then((rated) => {
        var episodeId = episode._id;
        episode.rated = rated;
        if (!rated.rated_id) {
          episode.rated = false;
          $scope.updateRating(episode, 0);
        } else {
          RatedService.getRated(episode.rated.rated_id).then((rated) => {
            $scope.updateRating(episode, rated.rating);
          }).catch((error) => {
            UIkit.notification({
              message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
              status: 'danger',
              timeout: 2500
            });
          })
        }
      }).catch(function (error) {
        UIkit.notification({
          message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
          status: 'danger',
          timeout: 2500
        });
      });
    };


    $scope.markEntireSeasonAsWatched = function () {
      $scope.watchAction = true;

      WatchedService.markEntireSeasonAsWatched($scope.user._id, $scope.season._id)
        .then((result) => {
          $scope.watchAction = false;
          $route.reload();
          UIkit.modal('#modal-watchSeason').hide();
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

    $scope.markSeasonAsWatched = function () {
      $scope.watchAction = true;

      WatchedService.markSeasonAsWatched($scope.user._id, $scope.season._id)
        .then((result) => {
          $scope.watchAction = false;
          $route.reload();
          UIkit.modal('#modal-watchSeason').hide();
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

    $scope.markSeasonAsNotWatched = function () {
      var episodesIds = [];
      $scope.season.episodes.forEach((episode) => {
        if (episode.watched) {
          episodesIds.push(episode._id);
        }
      });

      WatchedService.markSeasonAsNotWatched(episodesIds, $scope.user._id)
        .then((result) => {
          $route.reload();
          UIkit.modal('#modal-watchSeason').hide();
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

    $scope.markAsWatched = function (episode) {
      var episodeId = episode._id;
      WatchedService.markAsWatched($scope.user._id, episodeId)
        .then((watched) => {
          episode.watched = watched;
          $scope.updateProgress($scope.season.progress, 1);
        })
        .catch((error) => {
          UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
            status: 'danger',
            timeout: 2500
          });
        });
    }

    $scope.markAsNotWatched = function (episode) {
      var watchedId = episode.watched.watched_id;
      WatchedService.markAsNotWatched(watchedId)
        .then(() => {
          episode.watched = false;
          $scope.updateProgress($scope.season.progress, -1);
        })
        .catch((error) => {
          UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
            status: 'danger',
            timeout: 2500
          });
        });
    }

    $scope.follow = function (tvshow) {
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

    $scope.unfollow = function (tvshow) {
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

    $scope.rateEpisode = function(episode, rating){
      var episodeId = episode._id;
      if (episode.rated) {
          if (rating !== episode.rating) {
            $scope.updateRated(episode.rated.rated_id, rating);
            $scope.updateRating(episode, rating);
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> Rating edited!',
                status: 'success',
                timeout: 1500
            });
          } else {
            $scope.markAsNotRated(episode.rated.rated_id);
            $scope.updateRating(episode, 0);
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> Rating removed.',
                status: 'warning',
                timeout: 1500
            });
          }
      } else {
        $scope.markEpisodeAsRated(episode, rating);
      }
    }
    $scope.rate = function (tvshowId, rating) {
      if ($scope.tvshow.rated) {
        if (rating !== $scope.tvshow.rating) {
          $scope.updateRated($scope.tvshow.rated.rated_id, rating);
          $scope.updateRating($scope.tvshow, rating);
          UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> Rating edited!',
            status: 'success',
            timeout: 1500
          });
        } else {
          $scope.markAsNotRated($scope.tvshow.rated.rated_id);
          $scope.updateRating($scope.tvshow, 0);
          UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> Rating removed.',
            status: 'warning',
            timeout: 1500
          });
        }
      } else {
        $scope.markAsRated(tvshowId, rating);
        $scope.updateRating($scope.tvShow, rating);
        UIkit.notification({
          message: '<span uk-icon=\'icon: check\'></span> Rated!',
          status: 'success',
          timeout: 1500
        });
      }
    }

  $scope.markEpisodeAsRated = function(object, rating) {
    object.rating = rating;
    RatedService.markAsRated($scope.user._id, object._id, date = moment(), rating)
    .then((rated) => {
        object.rated = rated;
    })
    .catch((error) => {
      UIkit.notification({
        message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
        status: 'danger',
        timeout: 2500
      })});
      }

  $scope.markAsRated = function (tvshowId, rating) {
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

    $scope.markAsNotRated = function (ratedId) {
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

    $scope.updateRated = function (ratedId, rating) {
      var ratedObj = {
        "date": date = moment(),
        "rating": rating,
        "_id": ratedId
      };
      RatedService.updateRated(ratedObj);
    }

    $scope.updateRating = function (episode, rating) {
      episode.rating = rating;
    }

    $scope.range = function (count) {
      var ratings = [];
      for (var i = 0; i < count; i++) {
        ratings.push(i + 1)
      }
      return ratings;
    }
    $scope.goToMedia = function (media) {
      if (media.__t === 'TvShow') {
        $location.path('tvshow/' + media._id);
      } else if (media.__t === "Movie") {
        $location.path('movie/' + media._id);
      } else if (media.__t === "Episode"){
        $location.path('tvshow/' + media._tvshow_id + '/season/'+ media.season_number);
      }
    }

    $scope.updateProgress = function (progress, value) {
      progress.episodes_watched += value;
      progress.ratio = progress.episodes_watched / progress.total_episodes;
      if (progress.ratio == 1) $scope.season.watched = true;
      else $scope.season.watched = false;
    }

    $scope.getEpisodesIds = function() {
      return [$scope.season.episodes];
  }

  }]);
