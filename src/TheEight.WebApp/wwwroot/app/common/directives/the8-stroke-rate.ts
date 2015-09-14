angular.module("the8.common")
    .directive("the8StokeRate", () => {
        return {
            restrict: "A",
            require: "ngModel",
            scope: {
                "ngModel": "="
            },
            link: function(scope, element, attr, ngModel) {
                ngModel.$parsers.push(value => {
                    if (value.trim() === "") {
                        ngModel.$setValidity("integer", true);
                        return null;
                    }

                    const isInt = n => String(parseInt(n)) === n;

                    const validInt = isInt(value.trim());
                    ngModel.$setValidity("integer", validInt);
                    const strokeRate = validInt ? parseInt(value) : null;

                    if (validInt) {
                        const inRange = strokeRate >= 10 && strokeRate < 60;
                        ngModel.$setValidity("range", inRange);
                    } else {
                        ngModel.$setValidity("range", false);
                    }

                    return strokeRate;
                });
            }
        };
    });