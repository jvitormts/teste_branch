(function() {
    'use strict';

    angular
        .module('sejaDiretoApp')
        .factory('PreLeadsService', Service);

    function Service($http, $cookies) {
        var service = {};
        service.getPreLeads = getPreLeads;
        service.marcarLida = marcarLida;
        service.enviarParaFila = enviarParaFila;
        service.deletarPreLeads = deletarPreLeads;
        service.enviarEmailParaLead = enviarEmailParaLead;
        service.importFacebook = importFacebook;
        service.importXls = importXls;
        return service;

        function getPreLeads(dados){
            var req = {
                method: 'GET',
                url: 'mail',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            if(dados){
                req.method='POST';
                req.data=dados;
            }
            return $http(req);
        }
        function marcarLida(id){
            var req = {
                method: 'PUT',
                url: 'mail/'+id+'/lida',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            return $http(req);
        }


        function deletarPreLeads(dados){
            var req = {
                method: 'PUT',
                url: 'mail/delete',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: dados
            }
            return $http(req);
        }



        function enviarParaFila(dados, equipe){
            var req = {
                method: 'POST',
                url: 'mail/criar-lead/'+equipe.id,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: dados
            }
            return $http(req);
        }

        function enviarEmailParaLead(leadId, prelead){
            var req = {
                method: 'PUT',
                url: 'mail/lead/'+leadId,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: prelead
            }
            return $http(req);
        }




        function importFacebook(arquivo, equipeId){
            var req = {
                method: 'POST',
                url: 'import/facebook/'+equipeId,
                headers: {
                    'Content-Type': 'application/octet-stream'
                },
                data: arquivo
            }
            return $http(req);
		}
		

        function importXls(data){
            var req = {
                method: 'POST',
                url: 'import/xls/',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            }
            return $http(req);
		}
		
		
    }
})();