var kitso = angular.module('kitso');

kitso.controller('HomeController', ['$scope', '$location', '$timeout', 'AuthService', 'FeedService', function($scope, $location, $timeout, AuthService, FeedService) {

	$scope.logout = function() {
		AuthService.logout()
                // handle success
                .then(function () {
                    UIkit.notification({
                        message: '<span uk-icon=\'icon: check\'></span> Logged out! Redirecting...',
                        status: 'success',
                        timeout: 1500
                    });

                    $timeout(function() {
                        $location.path('/');
                        }, 1500);
                })
                // handle error
                .catch(function (error) {
                	console.log(error);
                    var dangerMessage = "Something went wrong...";

                    UIkit.notification({
                        message: '<span uk-icon=\'icon: check\'></span> ' + dangerMessage,
                        status: 'danger',
                        timeout: 2500
                    });
                });
	};
	var compareDates = function(a,b){
    return - moment(a.date).diff(moment(b.date))
  }

	AuthService.getStatus().then(function(){
    $scope.user = AuthService.getUser();
		loadFeed($scope.user._id);

  }).catch(function(){});

	var loadFeed = function(userId){
		FeedService.getFollowingUsersActivity(userId).then(function(result){
			$scope.feed = result;

			$scope.feed.forEach(function(activity){
				if(['watched', 'rated'].includes(activity.action_type)){
					activity.open = true;
				}
			})
		$scope.feed = $scope.feed.sort(compareDates)
		})
		.catch(
			function(result){
				console.log(result)
			}
		)
	}



	$scope.isLogged = function() {
		return AuthService.isLogged();
	};

	$scope.getActivityType = function(activity){
		if(activity.action_type == 'followed-page') {
			return 'followed';
		}
		else {
			return activity.action_type;
		}
	}

	$scope.getSeasonInfo = function(activity){
		episode = activity._action._media;
		seasons = episode.show.seasons;
		season_number = episode.season_number - 1;
		return seasons[season_number]
	}

	$scope.getActivityImage = function(activity){
		if(["watched","rated"].includes(activity.action_type)){
			if(activity._action._media){
				if (!activity._action._media.backdrop_path){
					return "https://image.tmdb.org/t/p/original/" + activity._action._media.still_path;
				}
				else {
					return activity._action._media.backdrop_path;
				}
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


}]);
