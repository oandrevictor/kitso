var kitso = angular.module('kitso');

kitso.service('NewsService', ['$q','$http', function ($q, $http) {

    // return available functions for use in the controllers
    return ({
        getPageMetadata: getPageMetadata,
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

}]);
