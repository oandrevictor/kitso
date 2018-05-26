var kitso = angular.module('kitso');

kitso.controller("SeasonController", ['$scope', '$location', '$timeout', '$routeParams', 'TvShowService',  'WatchedService',  'FollowService', 'RatedService', 'AuthService',
function($scope, $location, $timeout, $routeParams, TvShowService,  WatchedService, FollowService, RatedService, AuthService) {
  $('.full-loading').show();
  TvShowService.loadTvShow($routeParams.tvshow_id).then(() => {
    AuthService.getStatus().then(function(){
      $scope.user = AuthService.getUser();
      $scope.tvshow = TvShowService.getTvShow();

      TvShowService.loadSeason($routeParams.tvshow_id, $routeParams.season).then((season) => {
        $scope.season = season;
        $scope.season.episodes.forEach(function(episode){
          loadEpisodeActions(episode)
        });
        $('.full-loading').hide();

      })


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

  var loadEpisodeActions = function(episode){
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
      if (! rated.rated_id){
        episode.rated = false;
      }else{
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
    }).catch(function(){
    })

  }


    $scope.markAsWatched = function(episode){
      var episodeId = episode._id;
        WatchedService.markAsWatched($scope.user._id, episodeId)
        .then((watched) => {
            episode.watched = watched;
        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });
    }

    $scope.markAsNotWatched = function(episode){
      var watchedId = episode.watched.watched_id;
        WatchedService.markAsNotWatched(watchedId)
        .then(() => {
            episode.watched = false;
        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
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

    $scope.updateRating = function(episode, rating){
      episode.rating = rating;
    }

    $scope.range = function(count){
        var ratings = [];
        for (var i = 0; i < count; i++) {
            ratings.push(i+1)
        }
        return ratings;
    }

}]);
