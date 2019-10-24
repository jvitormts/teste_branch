(function () {
  'use strict';
  angular.module('sejaDiretoApp').directive('leadField', function () {
    return {
      'restrict': 'AE',
      'template': function (element, attrs) {
        var html = '<input ng-if="campo.tipo==\'TEXTO\'" type="text" class="form-control" ng-model="campo.valor">';

        html += '<input ng-if="campo.tipo==\'DATA\'" class="form-control" disable="false" format="L" locale="pt-br" min-date="minDate" min-view="month" moment-picker="campo.valor" ng-model="campo.valor"/>';

        html += '<select ng-if="campo.tipo==\'SELECT\' || campo.tipo==\'BOOLEAN\' " class="form-control" ng-model="campo.valor" ng-options="option as option for option in options"></select>';

        return html;
      },
      'scope': {
        campo: '='
      },
      'controller': function ($scope, $timeout) {
        var ctrl = this;
        $timeout(function () {
          $scope.tipoCampo = $scope.campo.tipo;
          $scope.options = ["SIM", "NÃO"];
          if ($scope.campo.tipo == 'SELECT') {
            $scope.options = $scope.campo.opcoes.split(';');
          }
        });
      },
      link: function link(scope, element, attrs) {
        attrs.tipo = scope.campo.tipo;
      },
      controllerAs: 'ctrl'
    }
  });
})();
