var kitso = angular.module('kitso');

kitso.controller('ProfileController', ['$scope', '$location', '$timeout', '$routeParams', 'AuthService', 'UserService',
  'FollowService', 'WatchedService', 'RatedService', 'UserListService', 'RecommenderService',
function ($scope, $location, $timeout, $routeParams, AuthService, UserService, FollowService, WatchedService, RatedService,
          UserListService, RecommenderService) {

  $('.full-loading').show();

  loading_feed = 0;

  mylists_current_page = 0;
  followedlists_current_page = 0;
  watched_current_page = 0;
  rated_current_page = 0;
  followers_current_page = 0;
  following_current_page = 0;

  stop_loading_mylists = false;
  stop_loading_followedlists = false;
  stop_loading_watched = false;
  stop_loading_rated = false;
  stop_loading_followers = false;
  stop_loading_following = false;

  $scope.mylists = [];
  $scope.watchedListAux = [];
  $scope.ratedListAux = [];
  $scope.followedList = [];

  var loaded = 0;
  var validtabs = ['overview','history','following','followers','settings']
  $scope.activetab = 'overview';
  AuthService.getStatus()
    .then(() => {
      $scope.user = AuthService.getUser();
      if ($routeParams.user_id){
        $scope.logged_user = $scope.user;
        UserService.getUser($routeParams.user_id).then((user)=> {
          $scope.user = user;
          loadUserRatedInfo(0);
          loadUserFollowInfo(0);
          loadUserWatchedInfo(0);
          loadUserWatchedHours();
          loadUserWatchedGenres();
          loadUserWatchedProgress();
          loadUserLists(0);
          FollowService.isFollowingUser($scope.logged_user._id, $scope.user._id).then((followed) => {
            $scope.user.followed = followed;
          }).catch((error) => {
            console.log(error)
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
              });
            })
          }).catch((error)=>{
            $location.path('/profile');
          })
        }
        else{
          $scope.logged_user = $scope.user;
          loadUserRatedInfo(0);
          loadUserFollowInfo(0);
          loadUserWatchedInfo(0);
          loadUserWatchedHours();
          loadUserWatchedGenres();
          loadUserWatchedProgress();
          loadUserLists(0);
          loadRecommendations();
        }
      });

    $scope.formatDate = function (date) {
      return moment(date).format('DD/MM/YYYY')
    };
    var compareDates = function(a,b){
      return - moment(a.date).diff(moment(b.date))
    }

    var checkFinishedLoading = function(){
      if (loaded > 2) {
        $('.full-loading').hide();
      }
    }

  Date.prototype.getMonthWeek = function() {
    var firstDay = new Date(this.getFullYear(), this.getMonth(), 1).getDay();
    return Math.ceil((this.getDate() + firstDay)/7);
  }

  var loadUserWatchedHours = function(){
    let date = new Date();
    getTimeSpentMonth(date.getMonth() + 1, date.getFullYear());
    getTimeSpentWeek(date.getMonth() + 1, date.getMonthWeek(), date.getFullYear());

    $scope.labelsWatchedHours = ["Hours percentage"];
    $scope.colors = ['#773095', '#EDEDED'];
    $scope.datasetOverride = [{
        fill: true,
        backgroundColor: [
          "#773095"
        ]
      }]
    $scope.options = {
      responsive: true,
      scales: {
        xAxes: [{ display: false, ticks: {min: 0, max:100}}],
        yAxes: [{ display: false, stacked: true}]
      },
      tooltips: {
        enabled: true,
        mode: 'single',
        callbacks: {
          label: function (tooltipItems, data) {
            return  (tooltipItems.xLabel).toFixed(2) + " %";
          }
        }
      }
    }
  }

  var getTimeSpentMonth = function(month, year){
    let data = {
      filter: "by_month",
      month: month,
      year: year
    }

    UserService.getTimespent($scope.user._id, data)
      .then(function (result) {
        result = result['total'];
        let hours = (result/60).toFixed(2);

        $scope.dataMonth = [[(100*result)/7300],[100]];
        if (hours == 1)
          $scope.timeSpentThisMonth = "Time spent this month: " + hours + " hour"
        else
          $scope.timeSpentThisMonth = "Time spent this month: " + hours + " hours"
      })
      .catch(function (error) {
        console.log(error)
      });
  }

  var getTimeSpentWeek = function(month, week, year){
    let data = {
      filter: "by_week",
      month: month,
      week: week,
      year: year
    }

    UserService.getTimespent($scope.user._id, data)
      .then(function (result) {
        result = result['total']
        let hours = (result/60).toFixed(2);

        $scope.dataWeek = [[(100*result)/168],[100]];
        if (hours == 1)
          $scope.timeSpentThisWeek = "Time spent this week: " + hours + " hour"
        else
          $scope.timeSpentThisWeek = "Time spent this week: " + hours + " hours"
      })
      .catch(function (error) {
        console.log(error)
      });
  }

  var loadUserWatchedProgress = function() {
    $scope.user_progress_labels = [];
    $scope.user_progress_data = [];
    $scope.u_p_override_colors = [{
        fill: true,
        backgroundColor: [
          "#773095"
        ]
      }]
    $scope.user_progress_options = {
            scales: {
                xAxes: [{
                    gridLines: {
                        display: false
                    }
        }],
                yAxes: [{
                    gridLines: {
                        display: false
                    }
        }]
            }
        };
    let date = new Date();
    month = date.getMonth() + 1
    week = date.getMonthWeek()
    year = date.getFullYear()
    let data = {
      filter: "by_month",
      month: month,
      year: year
    }
    UserService.getTimespent($scope.user._id, data)
      .then(function (result) {
        $scope.user_progress_labels = getDays(result, year, month);
        $scope.user_progress_data = getDailyValues(result, year, month);

      })
      .catch(function (error) {
        console.log(error)
      });

  }

  var getDays = function(result, year, month) {
    $scope.u_p_colors = []
    labels = []
    var i = 1;
    while(i < 31){
       $scope.u_p_colors.push('#773095')
      labels.push(i)
      i += 1
    }
    return labels
  }

  var getDailyValues = function(result, year, month){
    values = []
    for (day in result[year][month]){
      while (day > values.length + 1 ){
        values.push(0)
      }
      if (day != "total")
        values.push(result[year][month][day].total)
    }
    return values
  }


  var loadUserWatchedGenres = function() {
    $scope.labels = [];
    $scope.data = [];
    $scope.optionsGenres = { legend: { display: true, position: 'bottom'}};

    UserService.getGenresWatched($scope.user._id)
      .then(function (result) {
        $scope.labels = Object.keys(result);
        $scope.data = Object.values(result);
      })
      .catch(function (error) {
        console.log(error)
      });
  }

  var loadTab = function(){
    var query = $location.search()
    validtabs.forEach(function(tab){
      if (query[tab])
        $scope.activetab = tab;
    })
  }

  loadTab();

  $scope.isCurrentTab = function(tab){
    return tab === $scope.activetab;
  }


  var loadUserWatchedInfo = function(page){
    $('.bubble-loading').show();
    loading_feed = true;

    WatchedService.getAllWatched($scope.user._id, page)
      .then(function (watched) {
        if (watched.length === 0)
          stop_loading_watched = true;

        watched.forEach(function (watched) {
          watched.date = new Date(watched.date);
        });
        watched = watched.sort(compareDates);
        $scope.user.watched = watched;


        loaded++;
        $scope.user.watched_episodes = $scope.user.watched.filter((watched) => watched._media.__t == "Episode")
        $scope.user.watched_movies = $scope.user.watched.filter((watched) => watched._media.__t == "Movie")
        $scope.user.watched_tv_shows = [];
        $scope.user.watched_episodes.map(function(watched){
          var id = watched._media._season_id;
          if (!$scope.user.watched_tv_shows.includes(id))
            $scope.user.watched_tv_shows.push(id)
          }
        )

        $scope.user.watched.forEach(function (user_watched) {
          $scope.watchedListAux.push(user_watched);
        });

        $scope.user.watched = $scope.watchedListAux;

        loading_feed = false;
        $('.bubble-loading').hide();
        checkFinishedLoading();

        }).catch(function (error) {
        loaded++;
        checkFinishedLoading();
        loading_feed = false;
        $('.bubble-loading').hide();
        console.log(error);
      })
    }

  var loadUserRatedInfo = function(page){
    $('.bubble-loading').show();
    loading_feed = true;

    RatedService.getAllRated($scope.user._id, page)
      .then((ratings) => {
        if (ratings.length === 0)
          stop_loading_rated = true;

        if (page && page >=1 ){
          $scope.$applyAsync(function(){
            loaded +=1;
            ratings.forEach((rated) => {
              rated.date = new Date(rated.date);
            });

            $scope.user.ratings = $scope.user.ratings.concat(ratings);
            $scope.userFavoriteMovie = $scope.getUserFavoriteMovie();
            loadUserBackground();
            checkFinishedLoading();
          });
        }
        else {
          loaded +=1;
          ratings.forEach((rated) => {
            rated.date = new Date(rated.date);
          });

          $scope.user.ratings = ratings.sort(compareDates);
          $scope.userFavoriteMovie = $scope.getUserFavoriteMovie();
          loadUserBackground();
          checkFinishedLoading();
        }

        loading_feed = false;
        $('.full-loading').hide();
        $('.bubble-loading').hide();
      })
      .catch(
        function(result){
          loading_feed = false;
          $('.bubble-loading').hide();
          checkFinishedLoading();
        }
      )
  };

    var loadUserFollowInfo = function(page){
        loadFollowersInfo(page);
        loadFollowingInfo(page);
    }

    var loadFollowersInfo = function(page) {
        $('.bubble-loading').show();
        loading_feed = true;

        FollowService.getUsersFollowers($scope.user._id, page).then( function(followers){
            if (followers.length === 0)
                stop_loading_followers = true;

            if (page && page >=1 ){
                $scope.$applyAsync(function(){
                    $scope.user.followers = $scope.user.followers.concat(followers);
                });
            } else {
                $scope.user.followers = followers;
            }

            loading_feed = false;
            $('.full-loading').hide();
            $('.bubble-loading').hide();
        }).catch(function(error){
            console.log(error);
        })
    }

    var loadFollowingInfo = function(page) {
        $('.bubble-loading').show();
        loading_feed = true;

        FollowService.getUsersFollowing($scope.user._id, page).then( function(following){
            FollowService.getPagesFollowing($scope.user._id, page).then( function(following_pages){
                if (following.length === 0 && following_pages.length === 0)
                    stop_loading_following = true;
                if (page && page >=1 ){
                    $scope.$applyAsync(function(){
                        $scope.user.following = $scope.user.following.concat(following);
                        $scope.user.following_pages = $scope.user.following_pages.concat(following_pages);
                    });
                } else {
                    $scope.user.following = following;
                    $scope.user.following_pages = following_pages;
                }

                loading_feed = false;
                $('.full-loading').hide();
                $('.bubble-loading').hide();
            }).catch(function(error){
                console.log(error);
            })

        }).catch(function(error){
            console.log(error);
        })
    }

    var loadMyLists = function(page) {
      $('.bubble-loading').show();
      loading_feed = true;

      var paginated_list = [];
      var limit = 0;
      var skip = (page * 9) + 9;

      if (skip > $scope.user._lists.length) {
        limit = $scope.user._lists.length;
        $('.bubble-loading').hide();
        stop_loading_mylists = true;
      } else {
        limit = skip;
      }

      for (var i = page * 9; i < limit; i++) {
        paginated_list.push($scope.user._lists[i]);
      }

      paginated_list.forEach((listId) => {
        UserListService.loadUserList(listId).then( function(){
          let list = UserListService.getUserList();
          if (!$scope.isEmpty(list)) {
            $scope.mylists.push(list);
          }
        }).catch(function(error){
          console.log(error);
        })
      });

      $scope.user.lists = $scope.mylists;

      loading_feed = false;
    }

  var loadFollowedLists = function(page) {
    $('.bubble-loading').show();
    loading_feed = true;

    var paginated_followedList = [];
    var limit = 0;
    var skip = (page * 9) + 9;

    if (skip > $scope.user._following_lists.length) {
      limit = $scope.user._following_lists.length;
      $('.bubble-loading').hide();
      stop_loading_followedlists = true;
    } else {
      limit = skip;
    }

    for (var i = page * 9; i < limit; i++) {
      paginated_followedList.push($scope.user._following_lists[i]);
    }

    // Load following lists
    paginated_followedList.forEach((listObj) => {
      UserListService.loadUserList(listObj.userListId).then( function(){
        let following_lists = UserListService.getUserList();
        if (!$scope.isEmpty(following_lists)) {
          $scope.followedList.push(following_lists);
        }
      }).catch(function(error){
        console.log(error);
      })
    });

    $scope.user.following_lists = $scope.followedList;

    loading_feed = false;
  }

    var loadUserLists = function(){
      $scope.gridExhibitionMode = true;

      loadMyLists(0);
      loadFollowedLists(0);

      // LOAD WATCHLIST
      UserListService.loadUserList($scope.user._watchlist).then( function(){
        $scope.user.watchlist = UserListService.getUserList();
        loaded++;
        checkFinishedLoading();

      }).catch(function(error){
        loaded++;
        checkFinishedLoading();
        console.log(error);
      });
    }

    function isMovie(rating) {
      return rating._media.__t === "Movie";
    }

    var loadUserBackground = function () {
      var ratedMovies = $scope.user.ratings.filter(isMovie);

      if (ratedMovies.length > 0) {
        $scope.profileBackground =  ratedMovies[0]._media.helper.backdrop_path;
      } else {
        $scope.profileBackground = "/images/strange.jpg";
      }
    }

    $scope.unfollow_user = function(unfollowedUser){
      FollowService.isFollowingUser($scope.user._id, unfollowedUser._id).then( function(following){
        if (following.is_following) {
          FollowService.unfollowUser(following.following_id);
          $scope.user.following.splice($scope.user.following.indexOf(unfollowedUser),1);
        }
      })
    }

    $scope.unfollow_list = function (userlist) {
      UserListService.unfollowUserList(userlist)
        .then((response) => {
          UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> List Unfollowed!',
            status: 'success',
            timeout: 1500
          });

          UserService.getUser($scope.user._id).then((updatedUser)=> {
            $scope.user = updatedUser;

            var lists_followed = [];

            $scope.user._following_lists.forEach((listObj) => {
              UserListService.loadUserList(listObj.userListId).then( function(){
                let following_lists = UserListService.getUserList();
                if (!$scope.isEmpty(following_lists)) {
                  lists_followed.push(following_lists);
                }
              }).catch(function(error){
                console.log(error);
              })
            });

            $scope.user.following_lists = lists_followed;
          }).catch((error)=>{
            $location.path('/profile');
          })
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

    $scope.unfollow_page = function(unfollowedPage){
      FollowService.isFollowingPage($scope.user._id, unfollowedPage._id).then( function(following){
        if (following.is_following) {
          FollowService.unfollowPage(following.following_id);
          $scope.user.following_pages.splice($scope.user.following_pages.indexOf(unfollowedPage),1);
        }
      })
    }

    $scope.goToPage = function (followble_obj) {
      if (followble_obj.hasOwnProperty('__t')) {
        if (followble_obj.__t === 'TvShow') {
          $location.path('tvshow/' + followble_obj._id);
        } else if (followble_obj.__t === "Movie") {
          $location.path('movie/' + followble_obj._id);
        }
      } else {
        $location.path('person/' + followble_obj._id);
      }
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

    $scope.getUserFavoriteMovie = function () {
      let greaterRating = null;

      if ($scope.user.ratings.length > 0) {
        $scope.user.ratings.forEach((rated) => {
          if (rated._media.__t == "Movie") {
            if (greaterRating == null) {
              greaterRating = rated;
            } else if (greaterRating.rating <= rated.rating) {
              greaterRating = rated;
            }
          }
        });
      }

      if (greaterRating != null) {
        return greaterRating._media;
      } else {
        return greaterRating;
      }
    }

    $scope.getPoster = function(media){
      if (media.poster_path){
        return media.poster_path;
      }
      if(media.images && media.images.poster){
        return media.images.poster;
      }
      if(media.helper && media.helper.poster_path){
        if(media.helper.poster_path[0] === "/"){
          return 'https://image.tmdb.org/t/p/original' + media.helper.poster_path;
        }
        else{
          return  media.helper.poster_path;
        }
      }
    }

    $scope.getBackground = function(media){
      if (media === undefined || media === null) {
        return;
      }
      if(media.images && media.images.cover){
        return media.images.cover;
      }
      if(media.helper && media.helper.backdrop_path){
        if(media.helper.backdrop_path[0] === "/"){
          return 'https://image.tmdb.org/t/p/original' + media.helper.backdrop_path;
        }
        else{
          return  media.helper.backdrop_path;
        }
      }
    }

    $scope.getListPoster = function(userlist){
      var addedMovies = [];
      userlist.itens.forEach((item) => {
        addedMovies.push(item._media);
      });

      if (addedMovies.length > 0) {
        var first = addedMovies[0];
        if (first.poster_path) {
          return first.poster_path;
        }
        if (first.still_path) {
          return 'https://image.tmdb.org/t/p/w227_and_h127_bestv2/' + first.still_path;
        }
      } else {
        return "/images/default.jpg";
      }
    }

    $scope.changeExhibitionMode = function(mode) {
      if (mode === 'grid') {
        $scope.gridExhibitionMode = true;
      } else {
        $scope.gridExhibitionMode = false;
      }
    }

    $scope.getListBackground = function(userlist){
      var addedMovies = [];
      userlist.itens.forEach((item) => {
        addedMovies.push(item._media);
      });

      if (addedMovies.length > 0) {
        return addedMovies[0].backdrop_path;
      } else {
        return "/images/budapest.jpg";
      }
    }

    $scope.range = function(count){
      var ratings = [];
      for (var i = 0; i < count; i++) {
        ratings.push(i+1)
      }
      return ratings;
    }


    $scope.updateWatched = function (watched) {
      WatchedService.updateWatched(watched).then(function (watched) {
        UIkit.dropdown($('#watched-date-' + watched._id)).hide()
      }).catch(function (error) {
        console.log(error);
      })

    }

    $scope.follow = function(user){
      userId = user._id;
      FollowService.followUser($scope.logged_user._id, userId)
        .then((followed) => {
          user.followed = followed;
          user.followed.following_id = followed._id;
          user.followed.is_following = true;
        })
        .catch((error) => {
          UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
            status: 'danger',
            timeout: 2500
          });
        });
    };

    $scope.unfollow = function(user){
      var followId = user.followed.following_id;
      FollowService.unfollowUser(followId)
        .then((followed) => {
          user.followed = false;
        })
        .catch((error) => {
          UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
            status: 'danger',
            timeout: 2500
          });
        });
    }

    $scope.canEdit = function(user){
      if (!$scope.user || !$scope.logged_user)
        return false;
      else
        return ($scope.user._id === $scope.logged_user._id);
    }
    $scope.updateRated = function (rated, n) {
      rated.rating = n;
      RatedService.updateRated(rated)
        .then((rated) => {
          UIkit.dropdown($('#rated-' + rated._id)).hide();
        }).catch((error) => {
        console.log(error);
      });

  }

  $scope.submitForm = function () {
    if (this.editForm.$valid) {
      let payload = {
        _id: $scope.user._id,
        name: $scope.user.name,
        username: $scope.user.username,
        email: $scope.user.email,
        birthday: $scope.user.birthday,
        gender: $scope.user.gender,
        description: $scope.user.description,
        image: $scope.user.newimage,
        settings: {
          autowatch: $scope.user.settings.autowatch
        }
      }

        UserService.editUser(payload)
        // handle success
        .then(function () {
          $scope.descriptionArea = false;
          UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> User successfully edited.',
            status: 'success',
            timeout: 2500,
            pos: 'bottom-right'
          });
          if ($scope.user.newimage)
           $scope.user.image = $scope.user.newimage.split(',')[1]
        })
        // handle error
        .catch(function (error) {
          var dangerMessage = 'Something went wrong...';

          if (error.hasOwnProperty('code') && error.code === 11000) {
            if (error.errmsg.includes('username_1')) {
              dangerMessage = 'Username already in use';
            } else if (error.errmsg.includes('email_1')) {
              dangerMessage = 'Email already in use';
            }

              UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + dangerMessage,
                status: 'danger',
                timeout: 2500
              });
          } else {
              UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + dangerMessage,
                status: 'danger',
                timeout: 2500
              });
            }
        });
      }
    };

    $scope.deleteAccount = function () {
      if (this.deleteForm.$valid && $scope.confirmationText(this.delete.text)) {
        AuthService.deleteUser($scope.user._id, this.delete.password)
          .then(() => {
            UIkit.notification({
              message: '<span uk-icon=\'icon: check\'></span> Account deleted. Good Bye :(',
              status: 'success',
              timeout: 2500
            });

            $timeout(function () {
              UIkit.modal('#modal-delete2').hide();
              $location.path('/login');
            }, 1500);
          })
          .catch((error) => {
            if (error.status == 401) {
              UIkit.notification({
                message: "<span uk-icon=\'icon: check\'></span> Wrong password.",
                status: 'danger',
                timeout: 2000
              });
            } else {
              UIkit.notification({
                message: "<span uk-icon=\'icon: check\'></span> We can't delete your account right now. Please contact the support.",
                status: 'warning',
                timeout: 2500
              });
            }
          });
      } else {
        UIkit.notification({
          message: "<span uk-icon=\'icon: check\'></span> Please input both the password and the exact confirmation text.",
          status: 'warning',
          timeout: 2500
        });
      }
    };

    $scope.createList = function (title) {
      let listInfo = {
        title: title,
        description: "Describe this list",
        deletable: true,
        _user: $scope.user._id
      }
      UserListService.createList(listInfo).then(function(userlist){
        $scope.goToList(userlist._id);
      });
    }

    $scope.goToList = function (listId) {
      $location.path('/list/' + listId);
    }

    $scope.isInvalid = function (field) {
      return (field.$invalid && !field.$pristine);
    };

    $scope.confirmationText = function (text) {
      return text === 'I know this is a permanent action';
    }

    $scope.isEmpty = function (obj){
      return (Object.getOwnPropertyNames(obj).length === 0);
    }

    $scope.descriptionArea = false;
    $scope.toggleDescriptionArea = function () {
      $scope.descriptionArea = !$scope.descriptionArea;
    }

  $scope.getUserImage = function(){
    if ($scope.user && $scope.user.image){
      return "data:image/png;base64," + $scope.user.image;
    }
    else {
      return 'images/mask2.png'
    }
  }

  $scope.becomeVIP = function (new_vip) {
    let payload = {
      _id: $scope.user._id,
      vip: new_vip
    }
    UserService.editUser(payload)
    // handle success
    .then(function () {
      var message = 'You are now a VIP member!';
      if (!new_vip) {
        message = "VIP membership cancelled."
      }
      UIkit.notification({
        message: '<span uk-icon=\'icon: check\'></span> ' + message,
        status: 'success',
        timeout: 2500
      });
    })
    // handle error
    .catch(function (error) {
      UIkit.notification({
        message: '<span uk-icon=\'icon: check\'></span> Something went wrong...',
        status: 'danger',
        timeout: 2500
      });
    });
    $scope.goToProfile();
  };

  $scope.goToProfile = function () {
    $location.path('profile');
  }
  
  let loadRecommendations = function () {
    RecommenderService.getRecommendations($scope.user._id)
      .then((recommendedMovies) => {
        $scope.recommendedMovies = recommendedMovies;
      })
      .catch(function (error) {
        console.log(error);
        loaded +=1;
        checkFinishedLoading();
      });
  }

  $( "body" ).scroll(function() {
    if($("body").scrollTop() + $("body").height() >= $(document).height() - 100) {
      if (!loading_feed){
        // LISTS AND MY LISTS TAB
        if ($('#profile-lists.uk-active').length > 0 && ($('#my-lists')[0] !== undefined) &&
        ($('#my-lists')[0].parentElement.className === 'ng-scope uk-active'  && !stop_loading_mylists)) {
          mylists_current_page = mylists_current_page + 1;
          loadMyLists(mylists_current_page);
        }
        // LISTS AND FOLLOWED LISTS TAB
        else if ($('#profile-lists.uk-active').length > 0 && ($('#followed-lists')[0] !== undefined) &&
        ($('#followed-lists')[0].parentElement.className === 'ng-scope uk-active'  && !stop_loading_followedlists)) {
          followedlists_current_page = followedlists_current_page + 1;
          loadFollowedLists(followedlists_current_page);
        }
        // HISTORY AND WATCHED TAB
        else if (($('#profile-history')[0] !== undefined) && $('#profile-watched')[0] !== undefined &&
          $('#profile-history')[0].parentElement.className === 'ng-scope uk-active' &&
          $('#profile-watched')[0].parentElement.className === 'ng-scope uk-active' && !stop_loading_watched) {
          watched_current_page = watched_current_page + 1;
          loadUserWatchedInfo(watched_current_page);
        }
        // HISTORY AND RATED TAB
        else if (($('#profile-history')[0] !== undefined) && $('#profile-rated')[0] !== undefined &&
          $('#profile-history')[0].parentElement.className === 'ng-scope uk-active' &&
          $('#profile-rated')[0].parentElement.className === 'ng-scope uk-active' && !stop_loading_rated) {
            rated_current_page = rated_current_page + 1;
            loadUserRatedInfo(rated_current_page);
        }
        // FOLLOWERS TAB
        else if ($('#profile-following')[0] !== undefined &&
            $('#profile-following')[0].parentElement.className === 'ng-scope uk-active' && !stop_loading_following) {
            following_current_page = following_current_page + 1;
            loadFollowingInfo(following_current_page);
        }
        // FOLLOWERS TAB
        else if ($('#profile-followers')[0] !== undefined &&
          $('#profile-followers')[0].parentElement.className === 'ng-scope uk-active' && !stop_loading_followers) {
            followers_current_page = followers_current_page + 1;
            loadFollowersInfo(followers_current_page);
        }
      }
    }
  });

}]);
