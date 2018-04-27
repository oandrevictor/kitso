angular.module('MainController', []).controller('MainController', function($scope) {

    $scope.tagline = 'You watch, we save it!';

    $scope.method = function(){
      console.log("Method example");
      console.log("log example");
    }

});
