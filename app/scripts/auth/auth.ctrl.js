(function() {
    'use strict';
    angular.module('sejaDiretoApp').controller('AuthController', ['AuthService', '$state', '$scope', '$cookies', '$document','$window',
		function AuthController(AuthService, $state, $scope, $cookies, $document, $window) {
            var authCtrl = this;
            $scope.submitting = false;
            authCtrl.user = {

			};
			

            authCtrl.enviarReset = function(email){
                AuthService.sendEmailReset(email).then(function(){
					alert('Você receberá um e-mail com instruções para cadastrar sua nova senha');
					$state.go("login");
				});
            }
            authCtrl.disable = false;
            authCtrl.login = function() {
                var user = angular.copy(authCtrl.user);
                if(user.password != "123456"){
                    user.password = sha512(user.password);
                    AuthService.requireNewPwd = false;
                }else{
                    AuthService.requireNewPwd = true;
                }
                authCtrl.disable = true;
                AuthService.login(user.email, user.password).then(function(result) {
                    var today = new Date();
                    var expiresValue = new Date(today.getTime() + (8 * 60 * 60 * 1000));
                    $cookies.put('session', result.data.token, {
                        'expires': expiresValue
					});
					$window.sessionStorage.session = result.data.token;
                    if(AuthService.requireNewPwd){
                        $state.transitionTo("home.changepwd");
                    }else{
                        $state.transitionTo("home");
                    }
                }, function(response){
                    if (response.status == 401) {
                        authCtrl.message = "Acesso não autorizado (usuário e/ou senha incorretos).";
                        authCtrl.disable = false;
                    }else{
                        authCtrl.message = "Falha em acessar o sistema. Entre em contato com o suporte.";
                        authCtrl.disable = false;
                    }
                });
            };
		}
	]);
})();