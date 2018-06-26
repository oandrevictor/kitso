var kitso = angular.module('kitso');
kitso.controller('NewsPostboxController', ['$scope', 'NewsService', function($scope, NewsService){
  $scope.loadInfo = function(){
		if ($scope.temp_news.link){
			NewsService.getPageMetadata($scope.temp_news.link).then(function(metadata){
				$scope.newsInfo = metadata.data})
		}
		else {
			$scope.newsInfo = null;
		}
	}

  $scope.loadAutoComplete = function(){
		if ($scope.nameSearch){
			NewsService.getAutoComplete($scope.nameSearch).then(function(suggestions){
				$scope.autoCompleteSuggestions = suggestions.data})
		}
		else {
			$scope.autoCompleteSuggestions = null;
		}
	}

	$scope.temp_news.relateds = []
	$scope.toggleRelated = function(related) {
		if (!$scope.temp_news.relateds.includes(related)){
			$scope.temp_news.relateds.push(related)
		}
		else{
			var index = $scope.temp_news.relateds.indexOf(related)
			$scope.temp_news.relateds.splice(index, 1)
		}
	}

	$scope.validLink = function(){
		var pattern = /^((http|https):\/\/)/;
		return pattern.test($scope.temp_news.link)
	}

  $scope.postNews = function(){
		var news = {}
		news.link = $scope.temp_news.link;
		news._user = $scope.user._id;
		news.medias_ids = $scope.temp_news.relateds.filter(related => (related.__t));
		news.people_ids = $scope.temp_news.relateds.filter(related => !(related.__t));
		NewsService.postNews(news).then(function(news){
			if (news.status == 200){
				$scope.temp_news = {}
				$scope.creatingNews = false
				$scope.nameSearch = null
        window.location.reload(true);
			}
			console.log(news)
		})
	}

  $scope.isValidNews = function(){
    return $scope.temp_news.link && $scope.temp_news.relateds.length > 0 && $scope.newsInfo
  }
}])
