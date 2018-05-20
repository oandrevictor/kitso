kitso = angular.module('kitso');

kitso.controller('PersonEditController',
    ['$scope', '$location', '$timeout', 'PersonService', '$routeParams', 'AuthService',
    function($scope, $location, $timeout, PersonService, $routeParams, AuthService) {

        PersonService.loadPerson($routeParams.person_id)
            .then(() => {
                AuthService.getStatus().then(function(){
                    $scope.user = AuthService.getUser();
                    $scope.person = PersonService.getPerson();
                    $scope.person.birthday = new Date(moment($scope.person.birthday).format('YYYY/MM/DD'));

                    if (!$scope.person.image_url) {
                        $scope.person.image_url = "/images/person-edited.png";
                    }

                    if ($scope.person._appears_in.length === 0) {
                        $scope.background = "/images/It-Follows-background.jpg"; // Criar um cover default do kisto
                    } else {
                        PersonService.loadMedias($scope.person._appears_in)
                        .then((loadedMedias) => {
                            $scope.mediasPersonAppears = loadedMedias;
                            $scope.background = ($scope.mediasPersonAppears[Math.floor((Math.random() * $scope.mediasPersonAppears.length))])['media']['images']['cover'];
                        })
                        .catch((error) => {
                            UIkit.notification({
                                message: '<span uk-icon=\'icon: check\'></span> ' + 'Person medias data cannot be loaded. Sorry for that :(',
                                status: 'danger',
                                timeout: 2500
                            });
                        });
                    }


                }).catch((error) => {
                    UIkit.notification({
                        message: '<span uk-icon=\'icon: check\'></span> ' + 'Something went wrong. Try to reload the page.',
                        status: 'danger',
                        timeout: 2500
                    });
                });
            })
            .catch((error) => {
                UIkit.notification({
                    message: '<span uk-icon=\'icon: check\'></span> ' + 'Person data cannot be loaded. Sorry for that :(',
                    status: 'danger',
                    timeout: 2500
                });
            });
            
            $scope.savePerson = function () {
                PersonService.updatePerson($scope.person)
                .then(() => {
                    $location.path('person/' + $routeParams.person_id);
                    UIkit.notification({
                        message: '<span uk-icon=\'icon: check\'></span> ' + "Person updated. Thank you!",
                        status: 'success',
                        timeout: 2500
                    });
                })
                .catch((error) => {
                    UIkit.notification({
                        message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                        status: 'danger',
                        timeout: 2500
                    });
                });
            }

            $scope.discardChanges = function () {
                UIkit.notification({
                    message: '<span uk-icon=\'icon: check\'></span> ' + "Changes discarded.",
                    status: 'warning',
                    timeout: 2000
                });
                $location.path('person/' + $routeParams.person_id);
            }
}]);
