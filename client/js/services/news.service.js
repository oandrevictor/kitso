var kitso = angular.module('kitso');

kitso.service('NewsService', ['$q','$http', function ($q, $http) {

    // return available functions for use in the controllers
    return ({
        getPageMetadata: getPageMetadata,
        getAutoComplete: getAutoComplete,
        postNews: postNews,
        getRelatedNews: getRelatedNews
    });

    function getPageMetadata(url){
      var deferred = $q.defer();
      var info = {url: url}

      $http.post('/api/news/loadMetadata', info)
          .then(function (data) {
              if (data.status === 200) {
                  deferred.resolve(data);
              } else {
                  deferred.reject(data);
              }
          })
          .catch(function (error) {
              deferred.reject(error.data);
          });
      return deferred.promise;
    }

    function postNews(news){
      var deferred = $q.defer();

      $http.post('/api/news', news)
          .then(function (data) {
              if (data.status === 200) {
                  deferred.resolve(data);
              } else {
                  deferred.reject(data);
              }
          })
          .catch(function (error) {
              deferred.reject(error.data);
          });
      return deferred.promise;
    }

    function getAutoComplete(name){
      var deferred = $q.defer();
      var info = {name: name}

      $http.post('/api/news/getTaggable', info)
          .then(function (data) {
              if (data.status === 200) {
                  deferred.resolve(data);
              } else {
                  deferred.reject(data);
              }
          })
          .catch(function (error) {
              deferred.reject(error.data);
          });
      return deferred.promise;
    }

    function getRelatedNews(id) {
        var deferred = $q.defer();

        $http.get('/api/action/news/' + id)
            .then((response) => {
                if (response.status === 200) {
                    news = response.data;
                    deferred.resolve(news);
                } else {
                    deferred.reject(news);
                }
            })
            .catch((error) => {
                deferred.reject(error.data);
            });
        return deferred.promise;
    }

}]);
