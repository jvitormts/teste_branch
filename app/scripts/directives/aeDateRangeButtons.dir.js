(function () {
  'use strict';
  angular.module('sejaDiretoApp').directive('dateRangeButtons', function () {
    return {
      'restrict': 'AE',
      'template': function () {
        var html = '<div class="btn-group" ng-show="ctrl.type!=\'custom\'">';
        html += '   <a ng-repeat="btn in buttons" class="btn {{ctrl.type==btn ? \'btn-primary\' : \'btn-default\'}}" ng-click="ctrl.fillDate(btn)">';
        html += '      {{ctrl.btnNames[btn]}}';
        html += '       <md-tooltip md-direction="bottom" ng-if="ctrl.btnTooltips[btn]" >';
        html += '           {{ctrl.btnTooltips[btn].message}}'
        html += '       </md-tooltip>';
        html += '   </a>';
        html += '</div>';
		html += '<div class="input-group" ng-show="ctrl.type==\'custom\'" style="max-width:450px;">';		
		html += '	<span class="input-group-btn"> ';
        html += '	   <a class="btn btn-default" ng-click="ctrl.fillDate(buttons[0])" ng-if="ctrl.type==\'custom\'">';
        html += '	      ...';
        html += '	   </a>';
        html += '	</span>';
        html += '    <input class="form-control" disable="false" format="L" locale="pt-br" min-date="minDate" min-view="month" moment-picker="ngModelStart" ng-model="ngModelStart" ng-required="ngRequired"/>';
        html += '    <span class="input-group-addon" id="basic-addon1">a</span>';
        html += '    <input class="form-control" disable="false" format="L" locale="pt-br" min-date="ngModelStart" min-view="month" moment-picker="ngModelEnd" ng-model="ngModelEnd" ng-required="ngRequired"/>';
        html += '</div>';
        return html;
      },
      'scope': {
        ngModelStart: '=',
        ngModelEnd: '=',
        ngFirstValue: '=?',
        minDate: '=',
        buttons: '=',
        ngRequired: '='
      },
      'controller': function ($scope, $timeout) {
        var ctrl = this;
        ctrl.btnNames = {
          "today": "Hoje",
          "yesterday": "Ontem",
          "last3Days": "Últimos 3 dias",
          "lastWeek": "Última semana",
          "lastMonth": "Último mês",
          "lastForthnight": "Última Quinzena",
          "last3Months": "Últimos 3 Meses",
          "thisWeek": "Esta semana",
          "thisMonth": "Este mês",
          "lastYear": "Ultimo ano",
          "sinceBeginning": "Desde o começo",
          "custom": "Personalizado"
        };
        ctrl.btnTooltips = {
          "thisWeek": {
            message: "De segunda-feira até hoje."
          },
          "thisMonth": {
            message: "Do dia 01 até hoje."
          }
        };
        ctrl.fillDate = function (type) {
		  ctrl.type = type;
		  $scope.ngFirstValue = type;
          switch (type) {
            case "today":
              var hoje = moment().locale('pt-br');
              $scope.ngModelStart = hoje.format("L");
              $scope.ngModelEnd = hoje.format("L");
              break;
            case "yesterday":
              var hoje = moment().locale('pt-br');
              hoje.add(-1, 'day');
              $scope.ngModelStart = hoje.format("L");
              $scope.ngModelEnd = hoje.format("L");
              break;
            case "last3Days":
              var hoje = moment().locale('pt-br');
              var lastWeek = moment().locale('pt-br');
              lastWeek.add(-3, 'day');
              $scope.ngModelStart = lastWeek.format("L");
              $scope.ngModelEnd = hoje.format("L");
              break;
            case "lastWeek":
              var hoje = moment().locale('pt-br');
              var lastWeek = moment().locale('pt-br');
              lastWeek.add(-1, 'week');
              $scope.ngModelStart = lastWeek.format("L");
              $scope.ngModelEnd = hoje.format("L");
              break;
            case "lastMonth":
              var hoje = moment().locale('pt-br');
              var lastMonth = moment().locale('pt-br');
              lastMonth.add(-1, 'month');
              $scope.ngModelStart = lastMonth.format("L");
              $scope.ngModelEnd = hoje.format("L");
              break;
            case "lastForthnight":
              var hoje = moment().locale('pt-br');
              var lastForthnight = moment().locale('pt-br');
              lastForthnight.add(-15, 'day');
              $scope.ngModelStart = lastForthnight.format("L");
              $scope.ngModelEnd = hoje.format("L");
              break;
            case "last3Months":
              var hoje = moment().locale('pt-br');
              var lastForthnight = moment().locale('pt-br');
              lastForthnight.add(-3, 'months');
              $scope.ngModelStart = lastForthnight.format("L");
              $scope.ngModelEnd = hoje.format("L");
              break;
            case "thisWeek":
              var hoje = moment().locale('pt-br');
              var beginOfTheWeek = moment().locale('pt-br').startOf('isoweek');
              $scope.ngModelStart = beginOfTheWeek.format("L");
              $scope.ngModelEnd = hoje.format("L");
              break;
            case "thisMonth":
              var hoje = moment().locale('pt-br');
              var beginOfTheMonth = moment().locale('pt-br').startOf('month');
              $scope.ngModelStart = beginOfTheMonth.format("L");
              $scope.ngModelEnd = hoje.format("L");
              break;
            case "lastYear":
              var hoje = moment().locale('pt-br');
              var lastYear = moment().locale('pt-br');
              lastYear.add(-1, 'year');
              $scope.ngModelStart = lastYear.format("L");
              $scope.ngModelEnd = hoje.format("L");
              break;
			  case "sinceBeginning":
				var hoje = moment().locale('pt-br');
				$scope.ngModelStart = $scope.minDate.format("L");
				$scope.ngModelEnd = hoje.format("L");
				break;
          }
          $scope.ngFirstValue = type;
        };

        $timeout(function () {
          ctrl.buttonList = ["today", "yesterday", "last3Days", "lastWeek", "lastMonth", "lastForthnight", "last3Months", "custom"];
          $scope.buttons = $scope.buttons ? $scope.buttons : ctrl.buttonList;

          if ($scope.ngFirstValue) {
            ctrl.fillDate($scope.ngFirstValue);
          } else {
            ctrl.fillDate($scope.buttons[0]);
          }
        });
		$scope.$watch('ngFirstValue',function(newValue){
            ctrl.fillDate($scope.ngFirstValue);
		})
      },
      controllerAs: 'ctrl'
    }
  });
})();
