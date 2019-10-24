(function () {
    'use strict';
    angular.module('sejaDiretoApp').controller('LeadsController', Controller);

    function Controller(LeadsService, ConfigService, ModalService, $scope, $timeout, $stateParams) {
        var ctrl = {};
        ctrl.etapas = ConfigService.etapas;
        ctrl.leads = LeadsService.userLeads;
        ctrl.novoNegocio = ModalService.modalNovoNegocio;
		ctrl.loja = ConfigService.loja;
		ctrl.getTags = ConfigService.getTags;
        ctrl.onDrop = onDrop;
        ctrl.avancarEtapaPara = avancarEtapaPara;
		ctrl.isMobile = isMobile;
		ctrl.valorTotal = valorTotal;
		ctrl.totalComValor = totalComValor;
        init();
        return ctrl;

        function init() {
            $timeout(function () {
                $(".ps-container").perfectScrollbar('update');
			},2000);
			$scope.tags=[];

			$scope.$watch(function(){
				return LeadsService.userLeads;
			}, function(){
				ctrl.leads=LeadsService.userLeads;
			});
			LeadsService.refreshLeads();
		}
		

        function onDrop($event, lead, etapa) {
            ctrl.lead = lead;
            ctrl.interacaoAvanco = { para: etapa };
            ctrl.blockAvanco = false;
            ModalService.modalAvancoEtapa($scope);
        };

        function avancarEtapaPara() {
            LeadsService.avancarEtapaPara(ctrl.lead.visualId, ctrl.interacaoAvanco).then(function (result) {
				LeadsService.refreshLeads();
                $scope.$close();
            });
		}
		

		function valorTotal(leads){
			
			var valor = 0;
			if(leads.length > 0){
				leads.forEach(function(item){
					valor += item.valor ? item.valor : 0;
				});
			}

			return valor;
		}

		function totalComValor(leads){
			var valor = 0;
			if(leads.length > 0){
				leads.forEach(function(item){
					valor += item.valor ? 1 : 0;
				});
			}

			return valor;
		}

        function isMobile() {
            return "ontouchstart" in window;
        }
    }
})();