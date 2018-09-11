var kitso = angular.module('kitso');

kitso.service('SearchService', ['$q','$http', function ($q, $http) {

    // return available functions for use in the controllers
    return ({
      search: search
    });

    function search(type, search){
      var deferred = $q.defer();

      $http.get('/api/search?type=' + type + '&search=' + search)
          .then((response) => {
              if (response.status === 200) {
                  var results = response.data;
                  deferred.resolve(results);
              } else {
                  deferred.reject();
              }
          })
          .catch((error) => {
              deferred.reject(error.data);
          });

      return deferred.promise;
    }

}]);
