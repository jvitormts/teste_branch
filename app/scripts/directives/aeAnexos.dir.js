(function() {
    'use strict';
    angular.module('sejaDiretoApp').directive('aeAnexos', function() {
        return {
            'restrict': 'AE',
            'templateUrl': 'view/directives/aeAnexos.tmpl.html',
            'scope': {
                'interacao': '='
            },
            bindToController: true,
            controllerAs: 'attCtrl',
            'controller': function($timeout, AnexosService, $scope, $q) {
                var attCtrl=this;
                $timeout(function(){
                    attCtrl.interacao.uploading = false;
                });

                attCtrl.upload=function(){
                    if(!attCtrl.anexos){
                        return;
                    }
                    var requests=[];
                    var req ={};
                    attCtrl.interacao.uploading  = true;
                    for (var i = 0; i < attCtrl.anexos.length; i++) {
                        if(attCtrl.anexos[i].size > 5000000){
                            alert('O arquivo '+attCtrl.anexos[i].name+' excede o tamanho maximo permitido de 5Mb, o envio do mesmo não será realizado');
                        }else{
                            req= AnexosService.upload(attCtrl.anexos[i]);
                            requests.push(req);
                        }
                    }

                    $q.all(requests).then(function(results){
                       attCtrl.interacao.uploading = false;
                       results.forEach(function(result){
                            if(! attCtrl.interacao.anexosList ){
                                attCtrl.interacao.anexosList = [];
                            }
                            attCtrl.interacao.anexosList.push(result.data);
                       });
                    });
                }


                attCtrl.getAnexo=function(anexo){
                    AnexosService.getAnexo(anexo);
                };


                attCtrl.deleteAnexo=function(index){
                    var anexoId=attCtrl.interacao.anexosList[index].id;
                    AnexosService.remove(anexoId);
                    attCtrl.interacao.anexosList.splice(index,1);
                };

                $scope.$watch('attCtrl.anexos', attCtrl.upload);
                
            }
        }
    })
})();