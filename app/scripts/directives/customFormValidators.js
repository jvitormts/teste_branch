(function () {

  'use strict';

  angular.module('sejaDiretoApp')
    .directive('confirmPassword', function () {
      return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
          confirmPassword: '=confirmPassword'
        },
        link: function (scope, element, attributes, ngModel) {
          ngModel.$validators.confirmPassword = function (modelValue) {
            if (scope.confirmPassword == "") {
              delete scope.confirmPassword;
            }
            return modelValue === scope.confirmPassword;
          };
          scope.$watch('confirmPassword', function () {
            ngModel.$validate();
          });
        }
      };
    });

  angular.module('sejaDiretoApp')
    .directive('validNgModel', function () {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attributes, ngModel) {
          ngModel.$validators.validNgModel = function (modelValue) {
            return modelValue && modelValue.id > 0;
          };
          scope.$watch('validNgModel', function () {
            ngModel.$validate();
          });
        }
      };
    });


  angular.module('sejaDiretoApp').directive('validEmailChecker', [
    '$q', 'MailgunApiService',
    function ($q, MailgunApiService) {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
          ctrl.$asyncValidators.validEmailChecker = function (modelValue, viewValue) {
			var defer = $q.defer();
			
			defer.resolve(viewValue);
			return defer.promise;
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (elm.hasClass("ng-pristine") && attrs.validado == 'VALIDO') {
              defer.resolve(viewValue);
            } else if (elm.hasClass("ng-pristine") && attrs.validado == 'INVALIDO') {
              elm.focus();
              defer.reject(true);
            } else if (re.test(modelValue) && !elm.hasClass("ng-pristine")) {
              MailgunApiService.validateEmail(modelValue).then(function (result) {
                if (result.data.is_valid)
                  defer.resolve(viewValue);
                else
                  defer.reject(false);
              }, function () {
                defer.resolve(viewValue);
              });
            } else {
              if ((!modelValue || modelValue.trim() === '') && !attrs.required) {
                defer.resolve(viewValue);
              } else if (modelValue && modelValue.trim() !== '') {
                defer.reject(false);
              }
            }

            return defer.promise;
          };
        }
      }
    }
  ]);
})();
