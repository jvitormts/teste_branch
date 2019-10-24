(function() {
    'use strict';
    angular.module('sejaDiretoApp').controller('UsuarioController', Controller);

    function Controller(ConfigService, UsuarioService, usuario, equipes, AuthService, summernoteConfig) {
        var ctrl = {};
        ctrl.perfis = ConfigService.perfis;
        ctrl.summernoteConfig = summernoteConfig;
        ctrl.profile = ConfigService.profile;
        ctrl.equipes = equipes.data;
        ctrl.usuario = usuario;
        ctrl.init = init;
        ctrl.validarAcessoFuncao = ConfigService.validarAcessoFuncao;
        ctrl.validarPerfilEquipe = validarPerfilEquipe;
        ctrl.salvarUsuario = salvarUsuario;
		ctrl.validarFullAccess = ConfigService.validarFullAccess;
		ctrl.resetPassword = resetPassword;
        return ctrl;

        function init() {
            /*console.log(ctrl.usuario);
            var equipes = ctrl.usuario.equipeId.find(function(){
                
            });*/
            if(ctrl.usuario && ctrl.usuario.perfilId) {
                ctrl.usuario.perfil = ctrl.usuario.perfilId.id;
            }
        }
		function resetPassword(){
			AuthService.sendEmailReset(ctrl.usuario.email).then(function(){
				if(ctrl.profile.id==ctrl.usuario.id){
					alert('Você receberá um e-mail com instruções para cadastrar sua nova senha, se o e-mail registrado não for um e-mail válido entre em contato pelo suporte.');

				}else{
					alert('O usuário receberá instruções para cadastrar sua nova senha no e-mail registrado, se o e-mail registrado não for um e-mail válido entre em contato pelo suporte.');
				}
				
			});
		}
        function validarPerfilEquipe(perfilId){
            if(perfilId){
                var perfil = ctrl.perfis.filter(function(obj) {
                    return obj.id == perfilId;
                })[0];

                return ConfigService.validarAcessoTela('home.leads',{perfilId:perfil});
            }else{
                return false; 
            }

        }
        function salvarUsuario() {
            var user = angular.copy(ctrl.usuario);
            user.perfilId = ctrl.perfis.filter(function(obj) {
                return obj.id == user.perfil;
            })[0];
            if(!user.equipe){
                 user.equipe = ctrl.equipes.find(function(equipe){
					return equipe.id === 0;
				});
            }
            if (user.id > 0) {
				UsuarioService.editarUsuario(user).then(function(){
					if(usuario.assinatura){
						UsuarioService.updateAssinatura(usuario.assinatura);
					}
				});
            } else {
                UsuarioService.addUsuario(user).then(function(result){
					alert('O usuário receberá instruções para cadastrar a senha no e-mail registrado, se o e-mail registrado não for um e-mail válido entre em contato pelo suporte.');
                },function(result){
                    console.log(result);
                });
            }
            return true;
        }
    }
})();