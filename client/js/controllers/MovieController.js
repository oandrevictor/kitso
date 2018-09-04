var kitso = angular.module('kitso');

kitso.controller('MovieController',
['$scope', '$location', '$timeout', 'MovieService', 'WatchedService', 'FollowService', 'RatedService', 'UserListService','$routeParams', 'AuthService', 'NewsService',
function($scope, $location, $timeout, MovieService, WatchedService, FollowService, RatedService, UserListService, $routeParams, AuthService, NewsService) {
  $('.full-loading').show();
  $scope.newsbox_toggle = true;
    MovieService.loadMovie($routeParams.movie_id)
        .then(() => {
          AuthService.getStatus().then(function(){
            $scope.user = AuthService.getUser();
            $scope.movie = MovieService.getMovie();
            $scope.release_date_formated = moment($scope.movie.release_date).format('YYYY');
            $scope.movie.watchedDate = new Date(moment());
            $scope.movie.validWatchedDate = true;

            WatchedService.isWatched($scope.user._id , $scope.movie._id).then((watched) => {
                $scope.movie.watched = watched;
                if (! watched.watched_id)
                  $scope.movie.watched = false;
            }).catch((error) => {
              UIkit.notification({
                  message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                  status: 'danger',
                  timeout: 2500
              });
            });

            NewsService.getRelatedNews($scope.movie._id).then(function(news){
              $scope.news = news;
            });
            RatedService.isRated($scope.user._id ,$scope.movie._id).then((rated) => {
                $scope.movie.rated = rated;
                if (! rated.rated_id){
                  $scope.movie.rated = false;
                  $scope.updateRating(0);
                }else{
                  RatedService.getRated($scope.movie.rated.rated_id).then((rated) => {
                    $scope.updateRating(rated.rating);
                  }).catch((error) => {
                    UIkit.notification({
                        message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                        status: 'danger',
                        timeout: 2500
                    });
                  })
                }
            }).catch((error) => {
              UIkit.notification({
                  message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                  status: 'danger',
                  timeout: 2500
              });
            });

            RatedService.getVoteAverage($scope.movie._id).then((response) => {
              $scope.movie.vote_average = response.vote_average;
            }).catch((error) => {
              console.log(error);
            });

            FollowService.isFollowingPage($scope.user._id ,$scope.movie._id).then((followed) => {
              $scope.movie.followed = followed;
            }).catch((error) => {
              UIkit.notification({
                  message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                  status: 'danger',
                  timeout: 2500
              });
            });
            FollowService.countFollowers($scope.movie._id).then((count) => {
              $scope.movie.followers = count;
            }).catch((error) => {
              UIkit.notification({
                  message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                  status: 'danger',
                  timeout: 2500
              });
            });

            FollowService.friendsWatchingMedia($scope.user._id, $scope.movie._id).then((response) => {
              $scope.friendsWatching = response;
            })
            .catch((error) => {
                console.log('error', error);
            });

            FollowService.friendsRatingMedia($scope.user._id, $scope.movie._id).then((response) => {
              $scope.friendsRated = response;
            })
            .catch((error) => {
                console.log('error', error);
            });

            var lists = [];
            $scope.user._lists.forEach((listId) => {
              UserListService.loadUserList(listId).then( function(){
                var list = UserListService.getUserList();
                list.itens.forEach(function(item){
                  if (item._media._id == $scope.movie._id) {
                    list.movieAdded = true;
                  }
                })
                lists.push(list);
              }).catch(function(error){
                console.log(error);
              })
            });
            $scope.user.lists = lists;

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



    $scope.addToList = function(movieId, userListId){
        UserListService.addItem(userListId, movieId, $scope.user._id, date = moment())
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

    $scope.removeFromList = function(movieId, userListId) {
      UserListService.loadUserList(userListId).then( function() {
        var list = UserListService.getUserList();
        list['itens'].forEach(function(item){
          if (item['_media']['_id'] == movieId) {
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
          list.movieAdded = added;
        }
      })
    }

  $scope.markAsAdded = function(movieId, userListId) {
    UserListService.loadUserList(userListId).then( function() {
      UserListService.getUserList()['itens'].forEach(function(item){
        if (item['_media']['_id'] == movieId) {
          $scope.movieAdded = true;
        }
      });
    });
  }

  $scope.notAFutureDate = function(date) {
      return moment(date) <= moment();
  }

    $scope.markAsWatched = function(movieId, runtime){
      if($scope.movie.watchedTime === 'now') {
          $scope.movie.watchedDate = new Date(moment());
      }

      if ($scope.movie.watchedDate && $scope.notAFutureDate($scope.movie.watchedDate)) {
        $scope.movie.validWatchedDate = true;

        WatchedService.markAsWatched($scope.user._id, movieId, runtime, $scope.movie.genres, $scope.movie.watchedDate)
          .then((watched) => {
            $scope.movie.watched = watched;
            UIkit.modal('#modal-watchMovie').hide();
          })
          .catch((error) => {
            UIkit.notification({
              message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
              status: 'danger',
              timeout: 2500
            });
          });
      } else {
        $scope.movie.validWatchedDate = false;
      }
    };

    $scope.follow = function(movie, is_private){
        FollowService.followPage($scope.user._id, movie, is_private)
        .then((followed) => {
            $scope.movie.followed = followed;
            $scope.movie.followed.following_id = followed._id;
            $scope.movie.followed.is_following = true;

        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });
        FollowService.countFollowers($scope.movie._id).then((count) => {
          $scope.movie.followers = count;
        }).catch((error) => {
          UIkit.notification({
              message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
              status: 'danger',
              timeout: 2500
          });
        });
    };

    $scope.unfollow = function(movie){
      var followId = movie.followed.following_id;
        FollowService.unfollowPage(followId)
        .then((followed) => {
            $scope.movie.followed = false;
        })
        .catch((error) => {
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
        });
        FollowService.countFollowers($scope.movie._id).then((count) => {
          $scope.movie.followers = count;
        }).catch((error) => {
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
            $scope.movie.watched = false;
            $scope.movie.rating = 0;
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
    $location.path('movie/edit/' + $scope.movie._id.movie_id);
  }

  $scope.rate = function(movieId, rating){
    if ($scope.movie.rated && $scope.movie.rating !== 0) {
        if (rating !== $scope.movie.rating) {
          $scope.updateRated($scope.movie.rated.rated_id, rating);
          $scope.updateRating(rating);
          UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> Rating edited!',
            status: 'success',
            timeout: 1500
          });
        } else {
          $scope.markAsNotRated($scope.movie.rated.rated_id);
          $scope.updateRating(0);
          UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> Rating removed!',
            status: 'warning',
            timeout: 1500
          });
        }
    } else {
        $scope.markAsRated(movieId, rating);
        $scope.updateRating(rating);
        UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> Rated!',
            status: 'success',
            timeout: 1500
        });
        if($scope.user.settings.autowatch & !$scope.movie.watched){
          $scope.markAsWatched(movieId);
        }
    }
  }

  $scope.markAsRated = function(movieId, rating) {
    RatedService.markAsRated($scope.user._id, movieId, date = moment(), rating)
    .then((rated) => {
        $scope.movie.rated = rated;
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
            $scope.movie.rated = false;
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
      $scope.movie.rating = rating;
      $scope.updateVoteAverage();
    }

    $scope.range = function(count){
        var ratings = [];
        for (var i = 0; i < count; i++) {
            ratings.push(i+1)
        }
        return ratings;
    }

    $scope.updateVoteAverage = function() {
      RatedService.getVoteAverage($scope.movie._id).then((rated) => {
        $scope.movie.vote_average = rated.vote_average;
      }).catch((error) => {
        console.log(error);
      });
    }
}]);
