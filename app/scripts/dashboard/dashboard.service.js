(function () {
    'use strict';
    angular.module('sejaDiretoApp').factory('DashboardService', Service);

    function Service($http) {
		var service = this;

		
		service.getGrade = getGrade;
		service.getFunil = getFunil;
		service.getTempo = getTempo;
		service.getMotivos = getMotivos;

		
		return service;
		

		function getGrade(filtros){
			var req = {
                method: 'POST',
				url: 'dashboard/grade',
				data: filtros
            }

            return $http(req);

		}

		function getFunil(filtros){
			var req = {
                method: 'POST',
                url: 'dashboard/funil',
				data: filtros
            }
			
            return $http(req);

		}

		function getTempo(filtros){
			var req = {
                method: 'POST',
                url: 'dashboard/tempo',
				data: filtros
            }
			
            return $http(req);

		}


		function getMotivos(filtros){
			var req = {
                method: 'POST',
                url: 'dashboard/motivos',
				data: filtros
			}
			
			
            return $http(req);

		}
		

	}
})();