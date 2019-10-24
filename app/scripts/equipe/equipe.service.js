(function() {
    'use strict';

    angular
        .module('sejaDiretoApp')
        .factory('EquipeService', Service);

    function Service($http) {
        var service = {};
        service.getAllUsers = getAllUsers;
        service.getEquipes = getEquipes;
        service.getLeads = getLeads;
        service.getAtividades = getAtividades;
        service.novaEquipe = novaEquipe;
        service.editarEquipe = editarEquipe;
		service.loginAs = loginAs;
        service.fila = fila;
        return service;

        function getAllUsers(){
        	var req = {
                method: 'GET',
                url: 'equipe/allUsers',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            return $http(req);
        }
        function getEquipes(){
            var req = {
                method: 'GET',
                url: 'equipe',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            return $http(req);
        }
        function novaEquipe(equipe){
            var req = {
                method: 'POST',
                url: 'equipe',
                headers: {
                    'Content-Type': 'application/json'
                },
                data:equipe
            }
            return $http(req);
        }
        function editarEquipe(equipe){
            var req = {
                method: 'PUT',
                url: 'equipe',
                headers: {
                    'Content-Type': 'application/json'
                },
                data:equipe
            }
            return $http(req);
        }
        function fila(usuarioId){
            var req = {
                method: 'PUT',
                url: 'equipe/fila/'+usuarioId,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            return $http(req);
        }
        function getLeads(usuarioId){
            
            var req = {
                method: 'GET',
                url: 'equipe/leads/'+usuarioId,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            return $http(req);
        }
        function getAtividades(usuarioId){
            
            var req = {
                method: 'GET',
                url: 'equipe/atividades/'+usuarioId,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            return $http(req);
		}
		
        function loginAs(usuarioId) {

            var req = {
                method: 'GET',
                url: 'UsuarioManager/loginAs/'+usuarioId
            }

            return $http(req);
        }
    }
})();