(function() {
    'use strict';
    angular.module('sejaDiretoApp').directive('leadCard', function() {
        return {
            'restrict': 'AE',
            'templateUrl': function(){
                if(CSS.supports('display','grid')){
                    return 'view/directives/card.html?v=230123';
                }else{
                    return 'view/directives/leadCard.html';
                }
			},
			scope: {
				'habilitarTransferencia':'=',
				'lead':'='
			},
            'controllerAs': 'ctrl',
            'controller': function(ModalService, ConfigService, $state) {
				var ctrl = this;
				ctrl.loja = ConfigService.loja;
				ctrl.openModal = function(leadId){
						ModalService.showLeadModalById(leadId);
					
				}
            }
        }
	});

})();