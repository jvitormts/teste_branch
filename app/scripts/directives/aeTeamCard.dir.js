(function() {

'use strict';

  angular.module('sejaDiretoApp')
         .directive('aeTeamCard', function(){
           return {
             'restrict': 'AE',
             'templateUrl': 'scripts/shared/teamCard.html',
          	'controller': function ($scope, ContactService) {
          			$scope.isDeleting = false;

          			$scope.deleteUser = function () {
          				$scope.isDeleting = true;
          				//ContactService.removeContact($scope.user);
          				$scope.isDeleting = false;
          			};

                $scope.showUserFunnelSteps = function(userId) {
                  console.log(userId);
                };
            }
          };
        });
})();
