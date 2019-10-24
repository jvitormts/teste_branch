(function() {
    'use strict';
    angular.module('sejaDiretoApp').controller('HomeController', Controller);

    function Controller(ConfigService, ModalService, AuthService, $timeout, $window, $cookies,$state, $localStorage) {
        var ctrl = {};
        ctrl.profile = ConfigService.profile;
        ctrl.loja = ConfigService.loja;
		ctrl.rede = ConfigService.rede;
		console.log(ConfigService);
		ctrl.acessoEspecial = ConfigService.acessoEspecialLojas;
        ctrl.logout = logout;
        ctrl.openMenu = openMenu;
        ctrl.validarAcessoFuncao = ConfigService.validarAcessoFuncao;
        ctrl.modalUsuario = ModalService.modalUsuario;
        ctrl.textoBotaoLoja = textoBotaoLoja;
        ctrl.init = init;
		ctrl.responsive = responsive;
		ctrl.trocarLoja=trocarLoja;
        return ctrl;
		

		
        function calcResponsive(){
            var menuSize = angular.element(document).find(".navbar-menu .menu-item").length;
                
            var calc = $window.innerWidth - 246 - (menuSize*120);

            if(ctrl.validarAcessoFuncao('TROCAR_LOJA', ctrl.profile) && ctrl.rede && ctrl.rede.length > 1){
                calc = $window.innerWidth - 423 - (menuSize*120)
                angular.element(document).find("div.sd-ul-container").addClass("rede");
            }

            if(calc<0){
                angular.element(document).find("div.sd-navbar-content").addClass("responsive");
            }
        }
        function init() {
            
            $timeout(function(){
                calcResponsive();
            });

            $(window).on("resize",function(){
                calcResponsive();
            });

            $(".main-content").on("click",function(){
                if($("div.sd-ul-container.vertical").hasClass("in"))
                    $("#menubar-open").click();
			});
		
        }
        function textoBotaoLoja(texto){
            if(texto.length > 16){
                return texto.substring(0,16)+"...";
            }
            return texto;
        }
        function logout() {
            window.location = '/logout';
		}
		
		function trocarLoja(lojaId){
			delete $localStorage.filtrosCliente;
			AuthService.trocarLoja(lojaId).then(function(result){
				var today = new Date();
				var expiresValue = new Date(today.getTime() + (8 * 60 * 60 * 1000));
				$cookies.put('session', result.data.token, {
					'expires': expiresValue
				});
				$window.sessionStorage.session = result.data.token;
				ConfigService.loaded=false;
				$state.reload();
			});
		}

        function openMenu(menu, ev) {
            $('.page-chatbar').removeClass('open');
            $('#menuContainer').css('display', 'flex');
            $('#notificationContainer').hide();
            menu.open(ev);
        };

        function responsive(){
            return false;
        }
    }
})();