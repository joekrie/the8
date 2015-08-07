angular.module("shared")
	.directive("the8StrokeRate", [function () {
	    return {
	        restrict: "A",
	        require: "ngModel",
	        scope: {
	            ngModel: "="
	        },
	        link: function (scope, element, attr, ngModel) {
	            ngModel.$parsers.push(function (value) {
	                if (value.trim() === "") {
	                    ngModel.$setValidity("integer", true);
	                    return null;
	                }

	                function isInt(n) {
	                    return String(parseInt(n)) === n;
	                }
	                var validInt = isInt(value.trim());

	                ngModel.$setValidity("integer", validInt);
	                var strokeRate = validInt ? parseInt(value) : null;

	                if (validInt) {
	                    var inRange = strokeRate >= 10 && strokeRate < 60;
	                    ngModel.$setValidity("range", inRange);
	                } else {
	                    ngModel.$setValidity("range", false);
	                }

	                return strokeRate;
	            });
	        }
	    };
	}]);