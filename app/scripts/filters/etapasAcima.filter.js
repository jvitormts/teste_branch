(function() {
	'use strict';
	angular.module('sejaDiretoApp').filter('filterEtapasAcima', function() {
		return function(input, ordem) {
			if (!ordem) {
				return input;
			}
			return input.filter(function(obj) {

				return obj.ordem > ordem;
			}, ordem);
		};
	});
})();