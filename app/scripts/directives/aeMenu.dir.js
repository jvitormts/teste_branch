(function() {
    'use strict';
    angular.module('sejaDiretoApp').directive('aeMenu', function() {
        return {
            'restrict': 'AE',
            'templateUrl': 'view/directives/sd-menu.html',
            'controllerAs': 'menuCtrl',
            'controller': function(ConfigService, AuthService, $filter, $state, $scope, $timeout, ModalService) {
				
					var ctrl = this;
					ctrl.profile = ConfigService.profile;
					ctrl.permissao = ConfigService.profile ?  ConfigService.profile.perfilId.segurancaTela : 0;
					
					ctrl.habilitaEncaminhamento = ConfigService.loja.habilitaEncaminhamento;
					ctrl.negocio = ConfigService.loja.negocio;
					ctrl.modalUsuario = ModalService.modalUsuario;
					ctrl.menu = ConfigService.menu.filter(function(item){
						return ((item.permissao & ctrl.permissao) && !AuthService.requireNewPwd)  || ctrl.permissao == 16384;
					});
					if(!ctrl.habilitaEncaminhamento){
						ctrl.menu = ctrl.menu.filter(function(item){
							return item.nome != "Relatórios da Rede";
						});
					}
					ctrl.menu = $filter('orderBy')(ctrl.menu,'ordem');
					if(ctrl.menu.length>4){
						ctrl.menu2 = ctrl.menu.splice(4,ctrl.menu.length);
					}
					
					ctrl.checkPermissao = function(item) {
						return ((item.permissao & ctrl.permissao) && !AuthService.requireNewPwd) || ctrl.permissao == 16384;
					};

					$scope.$watch(function(){
						return $state.$current.name;
					}, function(newVal, oldVal){
						$timeout(function(){
							if(ctrl.menu2){
								ctrl.currentState = ctrl.menu2.find(function(obj){
									return obj.href  == newVal;
								});
							}
						});
						
					});
				
            }
        };
    });
})();