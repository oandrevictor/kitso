var kitso = angular.module('kitso');

kitso.service('RecommenderService', ['$q', '$http', function ($q, $http) {

  return ({
    getRecommendations: getRecommendations
  });
  
  function getRecommendations(user_id) {
    let deferred = $q.defer();
    
    let bodyReq = {user_id: user_id, n: 5};
    
    $http.post('http://italohmb.pythonanywhere.com/recommendation', bodyReq)
      .then(function (response) {
        if (response.status === 200) {
          deferred.resolve(response.data);
        } else {
          deferred.reject();
        }
      })
      .catch(function (error) {
        user = error.data;
        deferred.reject(error.data);
      });
    
    return deferred.promise;
  }
  
}]);
