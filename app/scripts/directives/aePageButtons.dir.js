(function() {
    'use strict';
    angular.module('sejaDiretoApp').directive('pageButtons', function() {
        return {
            restrict: 'AE',
            bindToController: true,
            template: function() {
                var html = '<section layout="row" layout-align="center" layout-sm="column" layout-wrap="">';
                html += '<ul class="pagination">'+
                            
                            '<li ng-if="pgCtrl.ngModel==0" class="disabled"><a><<</a></li>'+
                            '<li ng-if="pgCtrl.ngModel>0"><a ng-click="pgCtrl.click(pgCtrl.ngModel-1)"><<</a></li>'+
                            

                            '<li ng-if="pgCtrl.buttons[0]>0" ><a ng-click="pgCtrl.click(pgCtrl.buttons[0])">...</a></li>'+


                            '<li ng-repeat="button in pgCtrl.buttons" ng-class="{ativo: button == pgCtrl.currentPage}"><a ng-click="pgCtrl.click(button)">{{button+1}}</a></li>'+


                            '<li ng-if="pgCtrl.buttons[pgCtrl.buttons.length-1]<pgCtrl.pages-1" ><a ng-click="pgCtrl.click(pgCtrl.buttons[0])">...</a></li>'+
                            
                            '<li ng-if="pgCtrl.ngModel==pgCtrl.pages-1" class="disabled"><a>>></a></li>'+
                            '<li ng-if="pgCtrl.ngModel!=pgCtrl.pages-1"><a ng-click="pgCtrl.click(pgCtrl.ngModel+1)">>></a></li>'+
                        
                        '</ul>';
                html += '</section>';
                return html;
            },
            'scope': {
                ngModel: '=',
                pages: '=',
                reloadFunction: '='
            },
            controllerAs: 'pgCtrl',
            controller: function($timeout,$scope) {
                var ctrl = this;
                ctrl.calcularPaginacao = function(){
                    if(!ctrl.ngModel){
                        ctrl.ngModel = 0;
                    }
                    ctrl.currentPage=ctrl.ngModel;
                    ctrl.buttons = [];
                    if(!ctrl.pages || ctrl.pages==0){
                        ctrl.pages=1;
                    }
                    var from=ctrl.currentPage-1;

                    var to=ctrl.currentPage+1;

                    if(from < 0){
                        to += from * -1;
                        from = 0;
                    }

                    if(to>ctrl.pages){
                        to = ctrl.pages;
                    }else if(to < ctrl.pages){
                        to += 1;
                    }
                    if(to-from <= 2 && from >= 1){
                        from --;
                    }
                    for(var i=from; i<to; i++){
                        ctrl.buttons.push(i);
                    }
                }
                $scope.$watch("pgCtrl.pages",function(){
                    ctrl.calcularPaginacao();
                    
                });
                $scope.$watch("pgCtrl.ngModel",function(value){
					ctrl.calcularPaginacao();
				});
				
				ctrl.click=function(value){
					ctrl.ngModel = value;
					ctrl.reloadFunction(value);
				};
            }
        }
    });
})();