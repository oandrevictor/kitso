var kitso = angular.module('kitso');

kitso.controller("SeasonController", ['$scope', '$location', '$route', '$timeout', '$routeParams', 'TvShowService', 'WatchedService', 'FollowService', 'RatedService', 'UserListService', 'AuthService',
  function ($scope, $location, $route, $timeout, $routeParams, TvShowService, WatchedService, FollowService, RatedService, UserListService, AuthService) {
    $('.full-loading').show();
    TvShowService.loadTvShow($routeParams.tvshow_id).then(() => {
      AuthService.getStatus().then(function () {
        $scope.user = AuthService.getUser();
        $scope.tvshow = TvShowService.getTvShow();

        TvShowService.loadSeason($routeParams.tvshow_id, $routeParams.season)
          .then((season) => {
            $scope.season = season;
            $scope.season.watchedDate = new Date(moment());
            $scope.season.validWatchedDate = true;
            loadEpisodeActions($scope.season);
            $scope.season.episodes.forEach(function (episode) {
              loadEpisodeActions(episode)
            });
            UIkit.modal('#modal-watchSeason').hide();
            $('.full-loading').hide();

            WatchedService.seasonProgress($scope.user._id ,$scope.season._id)
            .then((progress) => {
              $scope.season.progress = progress;
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
                var list = UserListService.getUserList();
                list.episodesAdded = [];
                list.itens.forEach(function(item){
                  if (item._media._id == $scope.season._id) {
                    list.seasonAdded = true;
                  }
                  $scope.season.episodes.forEach(function(episode){
                    if (item._media._id == episode._id) {
                      list.episodesAdded[episode._id] = true;
                    }
                  })
                })
                lists.push(list);
              }).catch(function(error){
                console.log(error);
              })
            });
            $scope.user.lists = lists;

            FollowService.friendsWatchingTvshow($scope.user._id, $scope.getEpisodesIds())
              .then((response) => {
                $scope.friendsWatching  = response;
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

    $scope.addToList = function(item, userListId){
      UserListService.addItem(userListId, item._id, $scope.user._id, date = moment())
        .then((added) => {
          updateAdded(true, userListId, item);
        })
        .catch((error) => {
          UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
            status: 'danger',
            timeout: 2500
          });
        });
    }

    $scope.removeFromList = function(itemRemoved, userListId) {
      UserListService.loadUserList(userListId).then( function() {
        UserListService.getUserList()['itens'].forEach(function(item){
          if (item['_media']['_id'] == itemRemoved._id) {
            UserListService.deleteItem(userListId, $scope.user._id, item['ranked'])
              .then((deleted) => {
                updateAdded(false, userListId, itemRemoved);
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

    var updateAdded = function(added, listId, item) {
      $scope.user.lists.forEach(function(list){
        if (list._id == listId) {
          if (item.__t == 'Season') {
            list.seasonAdded = added;
          } else {
            list.episodesAdded[item._id] = added;
          }
        }
      })
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
      episode.listed = {};

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

      RatedService.getVoteAverage($scope.season._id).then((rated) => {
        $scope.season.vote_average = rated.vote_average;
      }).catch((error) => {
        console.log(error);
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

      $scope.notAFutureDate = function(date) {
          return moment(date) <= moment();
      }

      $scope.markEntireSeasonAsWatched = function () {
        if($scope.season.watchedTime === 'now') {
          $scope.season.watchedDate = new Date(moment());
        }
        if ($scope.season.watchedDate  && $scope.notAFutureDate($scope.season.watchedDate)) {
          $scope.season.validWatchedDate = true;

          $scope.watchAction = true;

          WatchedService.markEntireSeasonAsWatched($scope.user._id, $scope.season._id, $scope.tvshow.episode_run_time[0], $scope.season.watchedDate)
            .then((result) => {
              $scope.watchAction = false;
              $route.reload();
              UIkit.modal('#modal-watchSeason').hide();
            })
            .catch((error) => {
              UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
              });
            });
        } else {
          $scope.season.validWatchedDate = false;
        }
    };

    $scope.markSeasonAsWatched = function () {
      if($scope.season.watchedTime === 'now') {
          $scope.season.watchedDate = new Date(moment());
      }
      if ($scope.season.watchedDate && $scope.notAFutureDate($scope.season.watchedDate)) {
        $scope.season.validWatchedDate = true;

        $scope.watchAction = true;

        WatchedService.markSeasonAsWatched($scope.user._id, $scope.season._id, $scope.tvshow.episode_run_time[0], $scope.season.watchedDate)
          .then((result) => {
            $scope.watchAction = false;
            $route.reload();
            UIkit.modal('#modal-watchSeason').hide();
          })
          .catch((error) => {
            UIkit.notification({
              message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
              status: 'danger',
              timeout: 2500
            });
          });
      } else {
        $scope.season.validWatchedDate = false;
      }
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
        })
        .catch((error) => {
          UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
            status: 'danger',
            timeout: 2500
          });
        });
    };

    $scope.markAsWatched = function () {
      if($scope.season.watchedTime === 'now') {
          $scope.season.watchedDate = new Date(moment());
      }
      if ($scope.season.watchedDate && $scope.notAFutureDate($scope.season.watchedDate)) {
        $scope.season.validWatchedDate = true;

        var episodeId = $scope.episode._id;
        WatchedService.markAsWatched($scope.user._id, episodeId, $scope.tvshow.episode_run_time[0], $scope.season.watchedDate, $scope.tvshow.genres)
          .then((watched) => {
            $scope.episode.watched = watched;
            $scope.updateProgress($scope.season.progress, 1);
            UIkit.modal('#modal-watchEpisode').hide();
          })
          .catch((error) => {
            UIkit.notification({
              message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
              status: 'danger',
              timeout: 2500
            });
          });

      } else {
        $scope.season.validWatchedDate = false;
      }
    };

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
        if($scope.user.settings.autowatch & !episode.watched){
          $scope.markAsWatched(episode);
        }
      }
    }

    $scope.rate = function (tvshowId, rating) {
      if ($scope.season.rated && $scope.season.rating !== 0) {
        if (rating !== $scope.season.rating) {
          $scope.updateRated($scope.season.rated.rated_id, rating);
          $scope.updateRating($scope.season, rating);
          UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> Rating edited!',
            status: 'success',
            timeout: 1500
          });
        } else {
          $scope.markAsNotRated($scope.season.rated.rated_id);
          $scope.updateRating($scope.season, 0);
          UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> Rating removed.',
            status: 'warning',
            timeout: 1500
          });
        }
      } else {
        $scope.markAsRated(tvshowId, rating);
        $scope.updateRating($scope.season, rating);
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
      $scope.season.rating = rating;
      RatedService.markAsRated($scope.user._id, tvshowId, date = moment(), rating)
        .then((rated) => {
          $scope.season.rated = rated;
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
          $scope.season.rated = false;
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
      RatedService.updateRated(ratedObj).then((response) => {
        $scope.updateVoteAverage();
      });
    }

    $scope.updateRating = function (episode, rating) {
      episode.rating = rating;
      $scope.updateVoteAverage();
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

    $scope.getRatingByUserId = function (userId, friendsRated) {
      var rating;
      friendsRated.forEach(function(friendRating){
        if(userId === friendRating._id) {
          rating = friendRating._ratings[0];
        }
      });

      return rating;
    }

    $scope.openWatchEpisodeModal = function (episode) {
      UIkit.modal('#modal-watchEpisode').show();
      $scope.episode = episode;
    };

    $scope.updateVoteAverage = function() {
      RatedService.getVoteAverage($scope.season._id).then((rated) => {
        $scope.season.vote_average = rated.vote_average;
      }).catch((error) => {
        console.log(error);
      });
    }
    }]);
