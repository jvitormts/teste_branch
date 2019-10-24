(function() {
    'use strict';
    angular.module('sejaDiretoApp').factory('NotificacoesService', Service);

    function Service($http) {
        var service = {};
        
        service.getNotificacoes = getNotificacoes;
        service.marcarLida = marcarLida;
        service.marcarTodas = marcarTodas;
        
        return service;

        function getNotificacoes() {
            var req = {
                method: 'GET',
                url: 'notificacoes'
            }

            return $http(req);
        }
        
        function marcarLida(id) {
            var req = {
                method: 'POST',
                url: 'notificacoes/'+id
            }

            return $http(req);
        }
        
        function marcarTodas() {
            var req = {
                method: 'POST',
                url: 'notificacoes/markAll'
            }

            return $http(req);
        }
    }
})();