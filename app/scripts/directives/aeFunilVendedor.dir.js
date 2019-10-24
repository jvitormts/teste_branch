(function () {
    'use strict';
    angular.module('sejaDiretoApp').directive('aeFunilVendedor', function () {
        return {
            'restrict': 'AE',
            'templateUrl': 'view/leads/leads.html?v=2105183',
            'scope': {
                'usuario': '=',
                'leads': '=',
                'profile': '=',
				'habilitarTransferencia': '=',
				'etapas':'='
            },
            bindToController: true,
            controllerAs: 'ctrl',
            'controller': function (ConfigService) {
                var ctrl = this;
                ctrl.loja = ConfigService.loja;

				ctrl.validarAcessoFuncao = ConfigService.validarAcessoFuncao;
				
				ctrl.getTags = ConfigService.getTags;

                
				ctrl.checkAll = function(etapa){
					etapa.selected = !etapa.selected;
					if(ctrl.leads){
						ctrl.leads.forEach(function(lead){
							if(lead.etapaFunilId == etapa.id){
								lead.selected=etapa.selected;
							}
						});
					}
				}



				ctrl.valorTotal = function(leads){
					var valor = 0;
					if(leads.length > 0){
						leads.forEach(function(item){
							valor += item.valor ? item.valor : 0;
						});
					}

					return valor;
				}

				ctrl.totalComValor = function(leads){
					var valor = 0;
					if(leads.length > 0){
						leads.forEach(function(item){
							valor += item.valor ? 1 : 0;
						});
					}

					return valor;
				}


				
            }
        }
    });
})();