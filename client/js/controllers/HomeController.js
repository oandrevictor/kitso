var kitso = angular.module('kitso');

kitso.controller('HomeController', ['$scope', '$location', '$timeout', 'AuthService', 'FeedService', 'UserListService', 'WatchedService', 'NewsService', 'LikedService', function($scope, $location, $timeout, AuthService, FeedService, UserListService, WatchedService, NewsService, LikedService) {
	$('.full-loading').show();
	$scope.temp_news = {}
	loading_feed = 0;
	current_page = 0;
	stop_loading = false;
	$scope.feed = [];

	var compareDates = function(a,b){
    return - moment(a.date).diff(moment(b.date))
  }


	$scope.getNewsObject = function(related){
		if (related.is_media){
			return related._media
		}
		else {
			return related._person
		}
	}

	$scope.getNewsRelatedName = function(related){
		if (related.is_media){
			if (related._media.name) {
				return related._media.name
			} else {
				return related._media.title
			}
		}
		else {
			return related._person.name
		}
	}

	$scope.formatRelated = function(relatedList, related){
		var len = relatedList.length;
		var index = relatedList.indexOf(related);

		if (index === len - 2) {
			return " and "
		} else if (index !== len - 1) {
			return ", "
		}
	}

	var loadUserLists = function(){
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
	}

	$scope.getMediaFromActivity = function(activity){
		return activity._action._media;
	}


	AuthService.getStatus().then(function(){
    $scope.user = AuthService.getUser();
		loadFeed($scope.user._id,0);
		loadUserLists();

  }).catch(function(){});


	$scope.addToList = function(activity, userListId){
		item = $scope.getMediaFromActivity(activity);
		id = item._id;
		UserListService.addItem(userListId, id, $scope.user._id, date = moment())
			.then((added) => {
				activity.listed[userListId] = true;
			})
			.catch((error) => {
				console.log(error)
				UIkit.notification({
					message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
					status: 'danger',
					timeout: 2500
				});
			});
	}

	$scope.removeFromList = function(activity, userListId) {
		item = $scope.getMediaFromActivity(activity);
		id = item._id;
		UserListService.loadUserList(userListId).then( function() {
			UserListService.getUserList()['itens'].forEach(function(item){
				if (item['_media']['_id'] == id) {
					UserListService.deleteItem(userListId, $scope.user._id, item['ranked'])
						.then((deleted) => {
							activity.listed[userListId] = false;
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

	$scope.range = function (count) {
		var ratings = [];
		for (var i = 0; i < count; i++) {
			ratings.push(i + 1)
		}
		return ratings;
	}


	$scope.itemIsListed = function(listid, activity) {
		item = $scope.getMediaFromActivity(activity);
		itemid = item._id
		if (activity.listed && activity.listed[listid]){
			return activity.listed[listid]
		}
		if ($scope.user.lists) {
			list = $scope.user.lists.filter(list => list._id === listid);
			if (list.length > 0){
				list = list[0]
				return list.itens.some(item => item._media._id === itemid);
			}
		}
		return false;
	}

	var loadFeed = function(userId, page){
		$('.bubble-loading').show();
		loading_feed = true;
		FeedService.getFollowingUsersActivity(userId, page).then(function(result){
			var newFeedPage = result;
			if (newFeedPage.length == 0)
				stop_loading = true

			newFeedPage.forEach(function(activity, index){
				newFeedPage[index].listed = {}
				if(['watched', 'rated', 'news'].includes(activity.action_type)){
					activity.open = true;
				}
				isLiked(activity);

				var media = $scope.getMediaFromActivity(activity);
				if (media && media._id){
					WatchedService.isWatched($scope.user._id, media._id).then((watched) => {
		        activity.watched = watched;
		        if (!watched.watched_id)
		          activity.watched = false;
		      }).catch((error) => {
		        UIkit.notification({
		          message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
		          status: 'danger',
		          timeout: 2500
		        });
		      });

				}
			}
		)
		if (page && page >=1 ){
			$scope.$applyAsync(function(){
				$scope.feed = $scope.feed.concat(newFeedPage).sort(compareDates);
			});
		}
		else {
			$scope.feed = newFeedPage.sort(compareDates);
		}
		loading_feed = false;
		$('.full-loading').hide();
		$('.bubble-loading').hide();

		})
		.catch(
			function(result){
				loading_feed = false;
				$('.bubble-loading').hide();

			}
		)
	}


  $scope.markAsWatched = function (activity) {
    var mediaId = $scope.getMediaFromActivity(activity)._id;
    WatchedService.markAsWatched($scope.user._id, mediaId)
      .then((watched) => {
        activity.watched = watched;
      })
      .catch((error) => {
        UIkit.notification({
          message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
          status: 'danger',
          timeout: 2500
        });
      });
  }

  $scope.markAsNotWatched = function (activity) {
		var media = $scope.getMediaFromActivity(activity)
    var watchedId = media.watched.watched_id;
    WatchedService.markAsNotWatched(watchedId)
      .then(() => {
        activity.watched = false;
      })
      .catch((error) => {
        UIkit.notification({
          message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
          status: 'danger',
          timeout: 2500
        });
      });
  }


	$scope.isLogged = function() {
		return AuthService.isLogged();
	};

	$scope.getActivityType = function(activity){
		if(activity.action_type == 'followed-page') {
			return 'followed';
		}
		else if (activity.action_type == 'news') {
			return 'posted a news about'
		}
		else {
			return activity.action_type;
		}
	}

	getMorePosts = function(page){

	}

	$( "body" ).scroll(function() {
		if($("body").scrollTop() + $("body").height() >= $(document).height() - 100) {
        if (!loading_feed && !stop_loading){
					current_page = current_page + 1;
					loadFeed($scope.user._id, current_page);
					console.log($scope.feed)
				}

    }
	});

	$scope.getSeasonInfo = function(activity){
		episode = activity._action._media;
		seasons = episode.show.seasons;
		season_number = episode.season_number;
		seasons = seasons.filter(function(season){ return season.season_number == season_number});
		return seasons[0]
	}

	$scope.getActivityUserLink = function(activity){
		return 'user/' + activity._user._id;
	}

	$scope.getActivitySeasonLink = function(activity){
		return 'tvshow/' + activity._action._media.show._id + '/season/' + activity._action._media.season_number
	}

	$scope.getActivityShowLink = function(activity){
		return 'tvshow/' + activity._action._media.show._id
	}

	$scope.getActivityObjectLink = function(action){
		if (action._media){
			media = action._media;
			if (media.__t == "Episode")
				return 'tvshow/' + media.show._id + '/season/' + media.season_number
			if (media.__t == "TvShow")
				return 'tvshow/' + media._id
			if (media.__t == "Movie")
				return 'movie/' + media._id
		}
		if (action._following){
			following = action._following;
			if (following.__t){
				if (following.__t == "TvShow")
					return 'tvshow/' + following._id
				if (following.__t == "Movie")
					return 'movie/' + following._id
				else
					return 'user/' + following._id
			}
			else
				return 'person/' + following._id
		}
		if (action._person){
			return 'person/' + action._person._id
		}
		if (action.metadata){
			return action.link;
		}
	}

	$scope.getActivityImage = function(activity){
		if (activity.action_type == 'news'){
			if( activity._action.metadata.ogImage)
				return activity._action.metadata.ogImage
			else
				return activity._action.metadata.images[0]
		}
		else if(["watched","rated"].includes(activity.action_type)){
			if(activity._action._media){
				if (!activity._action._media.backdrop_path){
					return "https://image.tmdb.org/t/p/original/" + activity._action._media.still_path;
				}
				else {
					return activity._action._media.backdrop_path;
				}
			}
		}
		else {
			if(activity._action._following.backdrop_path){
				return activity._action._following.backdrop_path;
			}
			else {
				return "https://image.tmdb.org/t/p/original" + activity._action._following.image_url;
			}
		}
	}

	$scope.getActivityReferedObject = function(activity){
		switch(activity.action_type) {
    case 'rated':
			if (!activity._action._media.name )
				activity._action._media.name = activity._action._media.title;
    	return activity._action._media;
  		break;
		case 'watched':
			if (!activity._action._media.name )
				activity._action._media.name = activity._action._media.title;
	    return activity._action._media;
	  	break;
		case 'followed':
	    return activity._action._following;
	  	break;
		case 'followed-page':
			if (!activity._action._following.name)
				activity._action._following.name = activity._action._following.title;
	    return activity._action._following;
	  	break;
		case 'news':
			var metadata = activity._action.metadata;
			if (metadata.ogTitle)
				metadata.name = metadata.ogTitle;
			else {
				metadata.name = metadata.title;
			}
			metadata.overview = metadata.desc;
			return metadata;
    default:
    	return 'a'
		}
	}

	$scope.getActivityDate = function(activity){
		then = moment(new Date(activity.date));
		now = moment();
		mins_dif = now.diff(then, 'minutes');
		hours_dif = now.diff(then, 'hours');
		days_dif = now.diff(then, 'days');
		months_dif = now.diff(then, 'months')
		years_dif = now.diff(then, 'years')
		if (mins_dif < 1)
			return "just now"
		if (years_dif >= 1)
			return years_dif.toString() + " years ago"
		if (months_dif >= 1)
			return months_dif.toString() + " months ago"
		if (days_dif >= 1)
			return days_dif.toString() + " days ago"
		if (hours_dif >= 1)
			return hours_dif.toString() + " hours ago"
		else
			return mins_dif.toString() + " minutes ago"

	}

	$scope.getActivityUser = function(activity){
		return activity._user;
	}

	var like = function(activity){
		LikedService.like($scope.user._id, activity._id).then(function(success){
			activity.liked.push($scope.user._id);
			activity.liked_by_me = true;
			activity.liked_info = success.data;
		})
	}
	var undoLike = function(activity){
		LikedService.undoLike(activity.liked_info).then(function(success){
			var remove_index = activity.liked.indexOf($scope.user._id);
			activity.liked.splice(remove_index, 1)
			activity.liked_by_me = false;
		})
	}

	var isLiked = async function(activity){
		var liked = await LikedService.isLiked($scope.user._id, activity._id);
		activity.liked_by_me = liked.is_liked;
		if (liked.is_liked)
			activity.liked_info = liked;
		return liked;
	}

	$scope.toggleLike = function(activity){
		if (activity.liked_by_me){
			undoLike(activity)
		}
		else{
			like(activity)
		}
	}

	$scope.getLikes = function(activity){
		return activity.liked.length;
	}


}]);
