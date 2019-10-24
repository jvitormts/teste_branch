(function() {
    'use strict';

    angular
        .module('sejaDiretoApp')
        .factory('UsuarioService', Service);

    function Service($http) {
        var service = {};
        service.addUsuario = addUsuario;
        service.editarUsuario = editarUsuario;
        service.deleteUsuario = deleteUsuario;
		service.mudarSenha = mudarSenha;
		service.updateAssinatura = updateAssinatura;
        return service;

        function addUsuario(usuario){
            var req = {
                method: 'POST',
                url: 'usuario',
                headers: {
                    'Content-Type': 'application/json'
                },
                data : usuario
            }
            return $http(req);
        }
        function editarUsuario(usuario){
            var req = {
                method: 'PUT',
                url: 'usuario/' + usuario.id,
                headers: {
                    'Content-Type': 'application/json'
                },
                data : usuario
            }
            return $http(req);
        }
        function mudarSenha(usuario, session){
            var req = {
                method: 'PUT',
                url: 'usuario/changePassword',
                headers: {
                    'Content-Type': 'application/json'
                },
                data : usuario
            }
            if(session){
                req.headers.session = session
            }
            return $http(req);
        }

        function deleteUsuario(usuarioId){
            var req = {
                method: 'DELETE',
                url: 'usuario/'+usuarioId,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            return $http(req);
		}
		
        function updateAssinatura(texto){
            var req = {
                method: 'POST',
				url: 'signature',
				data:texto,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            return $http(req);
        }
    }
})();