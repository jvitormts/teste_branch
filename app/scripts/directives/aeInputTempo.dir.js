(function() {
    'use strict';
    angular.module('sejaDiretoApp').directive('aeInputTempo', function() {
        return {
            'restrict': 'AE',
            'templateUrl': 'view/directives/aeInputTempo.tmpl.html',
            'scope': {
                'ngModel': '='
            },
            bindToController: true,
            controllerAs: 'itCtrl',
            'controller': function($scope, $timeout) {
                var itCtrl = this;
                var bases = [540, 60, 1];

                itCtrl.calc = function(model){
					if(model){
						var index=0;
						var base= 0;
						var value = 0;
						do{
							base = bases[index];
							value = model / base;
							index++;
						}while( model % base != 0);
						itCtrl.value = value;
						itCtrl.base = base;
					}
                }

                
                $timeout(function() {
                    itCtrl.base = 1;
                    
                    itCtrl.update = true;
                    $scope.$watch("itCtrl.ngModel",function(){
                        if(itCtrl.update){
                            itCtrl.calc(itCtrl.ngModel);
                        }
                    });

                    $scope.$watch("itCtrl.base", function(novo, antigo){
                        itCtrl.update=false;
                        if(novo != antigo){
                            itCtrl.ngModel = itCtrl.base * itCtrl.value;
                        }
                        $timeout(function(){
                            itCtrl.update=true;
                        });
                    });
                    $scope.$watch("itCtrl.value", function(novo, antigo){
                        itCtrl.update=false;
                        if(novo != antigo){
                            itCtrl.ngModel = itCtrl.base * itCtrl.value;
                        }
                        $timeout(function(){
                            itCtrl.update=true;
                        });
                    });
                });
                return itCtrl;
            }
        }
    });
})();