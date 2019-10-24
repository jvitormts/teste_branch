(function() {

	'use strict';

	angular.module('sejaDiretoApp')
		.filter("dateRange", function() {
			return function(items, field, params) {
				var dates = {};
				dates.today = new Date();

				dates.today.setHours(23);
				dates.today.setMinutes(59);
				dates.today.setSeconds(59);
				//Today at 23:59:59

				// 86400000 = One day in milliseconds
				dates.yesterday = new Date(dates.today.getTime() - 86400000);
				//1000 milliseconds= 1 second.
				dates.tomorrow = new Date(dates.today.getTime() + 1000);
				if (items == undefined) {
					return [];
				}
				return items.filter(function(item) {
					var date = new Date(item.agendamento[field]);
					var validate = false;
					if (params.begin != undefined && params.end != undefined) {
						return date.getTime() >= dates[params.begin].getTime() && date.getTime() < dates[params.end].getTime();
					} else if (params.begin != undefined && params.end == undefined) {
						return date.getTime() >= dates[params.begin].getTime();
					} else if (params.begin == undefined && params.end != undefined) {
						return date.getTime() < dates[params.end].getTime();
					} else {
						return false;
					}
				});
			};
		});
})();