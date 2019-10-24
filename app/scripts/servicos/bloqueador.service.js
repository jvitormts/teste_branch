(function () {
    'use strict';

    function createEl() {
        var domEl = document.createElement('section');
        domEl.style.zIndex = '9999';
        domEl.style.width = '100%';
        domEl.style.height = '100%';
        domEl.style.position = 'fixed';
        domEl.style.backgroundColor = 'rgba(15,15,15,0.6)';
        return domEl;
    }

    function Service() {
        var el = createEl();
        var service = {};

        service.bloquear = function()  {
            document.querySelector('body').insertAdjacentElement('afterbegin', el);
        };

        service.desbloquear = function () {
            document.querySelector('body').removeChild(el);
        };

        return service;
    }

    angular.module('sejaDiretoApp').service('BloqueadorService', Service);
})();