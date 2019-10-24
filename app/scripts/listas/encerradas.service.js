(function() {
    'use strict';

    angular
        .module('sejaDiretoApp')
        .factory('EncerradasService', Service);

    function Service($http, $cookies) {
        var service = {};
        service.getVendedores = getVendedores;
        service.getEncerradas = getEncerradas;
        service.getEncerradasExcel = getEncerradasExcel;
        return service;

        function getVendedores(){
        	var req = {
                method: 'get',
                url: 'encerradas/vendedores',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            return $http(req);
        }


        function getEncerradas(filtros){
            var req = {
                method: 'post',
                url: 'encerradas/list',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: filtros
            }
            return $http(req);
        }
        
        function getEncerradasExcel(filtros){
            var req = {
                method: 'post',
                url: 'encerradas/export',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: filtros,
                responseType:"blob"
            }
            return $http(req);
        }
    }
})();