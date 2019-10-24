(function() {
    'use strict';

    angular
        .module('sejaDiretoApp')
        .factory('AuthService', Service);

    function Service($http, $cookies) {
        var service = {};

        service.login = login;
        service.fillProfile = fillProfile;
        service.getProfile = getProfile;
        service.getAssinatura = getAssinatura;
		service.sendEmailReset = sendEmailReset;
		service.resetPwd = resetPwd;
		service.getUserReset = getUserReset;
        service.profile = {};
		service.trocarLoja = trocarLoja;
        return service;

        function login(username, password, callback) {

            var req = {
                method: 'POST',
                url: 'UsuarioManager/login',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    email: username,
                    password: password
                },
                timeout: 5000
            }

            return $http(req);
        }


        function fillProfile() {

            var req = {
                method: 'GET',
                url: 'UsuarioManager/loggedUser'
            }

            $http(req).then(function(response) {
                service.profile = response.data;
            });

        }


        function getProfile() {

            var req = {
                method: 'GET',
                url: 'UsuarioManager/loggedUser'
            }

            return $http(req);
		}
		

        function getUserReset(token) {

            var req = {
                method: 'GET',
                url: 'UsuarioManager/getUserReset/'+token
            }

            return $http(req);
		}
		

        function resetPwd(usuario, token) {
			
            var req = {
                method: 'POST',
				url: 'UsuarioManager/reset/'+token,
				data:usuario
            }

            return $http(req);
        }
        function sendEmailReset(email) {

            var req = {
                method: 'POST',
				url: 'UsuarioManager/resetPwd',
				data:{email:email}
            }

            return $http(req);
		}
		

        function getAssinatura() {

            var req = {
                method: 'GET',
                url: 'signature'
            }

            return $http(req);
		}
		
        function trocarLoja(lojaId) {

            var req = {
                method: 'GET',
                url: 'UsuarioManager/changeLoja/'+lojaId
            }

            return $http(req);
        }
    }
})();