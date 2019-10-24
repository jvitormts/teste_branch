(function() {
    'use strict';

    angular
        .module('sejaDiretoApp')
        .factory('ListaLeadsService', Service);

    function Service($http, $cookies) {
        var service = {};
        service.get = get;
		service.getExcel = getExcel;
		service.getMinMaxValor=getMinMaxValor;
        return service;

        function get(filtros){
        	var req = {
                method: 'post',
                url: 'listaLeads',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: filtros,
                responseType:"text"
            }
            return $http(req);
        }
        
        function getExcel(filtros){
            var req = {
                method: 'post',
                url: 'listaLeads/export',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: filtros,
                responseType:"blob"
            }
            return $http(req);
		}
		
		function getMinMaxValor(){
            var req = {
                method: 'get',
                url: 'listaLeads/miMaxValor',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            return $http(req);

		}
    }
})();