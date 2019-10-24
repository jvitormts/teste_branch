(function() {
    'use strict';

    angular
        .module('sejaDiretoApp')
        .factory('RedeService', Service);

    function Service($http) {
        var service = {};
        service.getRede = getRede;
        service.getEtapasLoja = getEtapasLoja;
        service.getEquipesLoja = getEquipesLoja;
        service.getEquipes = getEquipes;

        service.getDadosAtendimento = getDadosAtendimento;
        service.getDadosMotivosCancelamento = getDadosMotivosCancelamento;
        service.getDadosTaxaConversao = getDadosTaxaConversao;
        service.getDadosAtendimentoExcel = getDadosAtendimentoExcel;
        service.getDadosMotivosCancelamentoExcel = getDadosMotivosCancelamentoExcel;
        service.getDadosTaxaConversaoExcel = getDadosTaxaConversaoExcel;
        service.getDadosTempoPrimeiroAtendimento = getDadosTempoPrimeiroAtendimento;

        return service;


        function getRede(){
            var req = {
                method: 'GET',
                url: 'rede',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            return $http(req);
        } 
        function getEtapasLoja(id){
            var req = {
                method: 'GET',
                url: 'rede/etapas/'+id,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            return $http(req);
        }
        function getEquipesLoja(id){
            var req = {
                method: 'GET',
                url: 'rede/equipes/'+id,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            return $http(req);
        }  


        function getEquipes(id){
            var req = {
                method: 'GET',
                url: 'rede/equipes',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            return $http(req);
        }  


        function getDadosAtendimento(filtro){
        	var req = {
                method: 'POST',
                url: 'rede/atendimento',
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
                url: 'rede/atendimento/export',
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
                url: 'rede/motivos',
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
                url: 'rede/motivos/export',
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
                url: 'rede/taxaConversao',
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
                url: 'rede/taxaConversao/export',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: filtro,
                responseType:"blob"
            }
            return $http(req);
        } 




        function getDadosTempoPrimeiroAtendimento(filtro){
            var req = {
                method: 'POST',
                url: 'rede/tempoPrimeiroAtendimento',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: filtro
            }
            return $http(req);
        } 
    }
})();