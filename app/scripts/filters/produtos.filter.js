(function() {
    'use strict';
    angular.module('sejaDiretoApp').filter('produtosFilter', function() {
        return function(input, filtros) {
            if (!filtros) {
                return input;
            }
            return input.filter(function(obj) {
                var condicao = true;
                var situacao = true;
                var texto = true;
                if (filtros.texto) {
                    var text = filtros.texto.toLowerCase();
                    texto = false;
                    if(obj.fabricante){
                    	texto = texto || obj.fabricante.toLowerCase().indexOf(text) >= 0;
                    }
                    if(obj.modelo){
                    	texto = texto || obj.modelo.toLowerCase().indexOf(text) >= 0;
                    }
                    if(obj.placa){
                    	texto = texto || obj.placa.toLowerCase().indexOf(text) >= 0;
                    }
                }
                if(filtros.condicao){
                	condicao = filtros.condicao == obj.condicao;
                }
                if(filtros.situacao){
                	situacao = filtros.situacao == obj.situacao;
                }
                return texto && condicao && situacao;
            }, filtros);
        };
    });
})();