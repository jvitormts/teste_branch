(function() {
    'use strict';

    angular
        .module('sejaDiretoApp')
        .factory('RelatoriosService', Service);

    function Service($http) {
        var service = {};
        service.getDadosAtendimento = getDadosAtendimento;
        service.getDadosMotivosCancelamento = getDadosMotivosCancelamento;
        service.getDadosTaxaConversao = getDadosTaxaConversao;
        service.getDadosAtendimentoExcel = getDadosAtendimentoExcel;
        service.getDadosMotivosCancelamentoExcel = getDadosMotivosCancelamentoExcel;
        service.getDadosTaxaConversaoExcel = getDadosTaxaConversaoExcel;
        service.getDadosTempoPrimeiroAtendimento = getDadosTempoPrimeiroAtendimento;
        service.getDadosTempoPrimeiroAtendimentoExcel = getDadosTempoPrimeiroAtendimentoExcel;
        return service;


        function getDadosAtendimento(filtro){
        	var req = {
                method: 'POST',
                url: 'relatorios/atendimento',
                headers: {
                    'Content-Type': 'application/json' 
                },
                data: filtro
            }
            return $http(req);
        } 

        function getDadosAtendimentoExcel(filtro){
            var req = {
                method: 'POST',
                url: 'relatorios/atendimento/export',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: filtro,
                responseType:"blob"
            }
            return $http(req);
        } 


        function getDadosMotivosCancelamento(filtro){
            var req = {
                method: 'POST',
                url: 'relatorios/motivos',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: filtro
            }
            return $http(req);
        } 


        function getDadosMotivosCancelamentoExcel(filtro){
            var req = {
                method: 'POST',
                url: 'relatorios/motivos/export',
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: "application/x-octet-stream",
                data: filtro,
                responseType:"blob"
            }
            return $http(req);
        } 


        function getDadosTaxaConversao(filtro){
            var req = {
                method: 'POST',
                url: 'relatorios/taxaConversao',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: filtro
            }
            return $http(req);
        }


        function getDadosTaxaConversaoExcel(filtro){
            var req = {
                method: 'POST',
                url: 'relatorios/taxaConversao/export',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: filtro,
                responseType:"blob"
            }
            return $http(req);
        } 





        function getDadosTempoPrimeiroAtendimento(filtro){
            angular.forEach(filtro, function(value, index){
                if(value == null || value.length ==0 ){
                    delete filtro[index];
                }
			});
			
            var req = {
                method: 'POST',
                url: filtro.desagrupar ? 'relatorios/tempoPrimeiroAtendimentoDesagrupado' : 'relatorios/tempoPrimeiroAtendimento',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: filtro
            }
            return $http(req);
        }

         
        function getDadosTempoPrimeiroAtendimentoExcel(filtro){
            var req = {
                method: 'POST',
                url: 'relatorios/tempoPrimeiroAtendimento/export',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: filtro,
                responseType:"blob"
            }
            return $http(req);
        } 
    }
})();