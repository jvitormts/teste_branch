(function() {
    'use strict';

    angular
        .module('sejaDiretoApp')
        .factory('AcompanhamentoService', Service);

    function Service($http, $cookies) {
        var service = {};
        service.getAcompanhamento = getAcompanhamento;
        return service;


        function getAcompanhamento(filtros){
            var req = {
                method: 'post',
                url: 'acompanhamento',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: filtros
            }
            return $http(req);
        }
    }
})();