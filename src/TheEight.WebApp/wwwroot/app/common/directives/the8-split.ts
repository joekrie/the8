var splitUtilities = require("../utilities/splitUtilities");

angular.module("the8.common").directive("the8Split", () => {
    return {
        restrict: "A",
        require: "ngModel",
        scope: {
            "ngModel": "="
        },
        link: (scope, element, attr, ngModel: angular.INgModelController) => {
            ngModel.$formatters.push((value: moment.Duration) => splitUtilities.formatSplit(value));

            ngModel.$parsers.push((value: string) => {
                if (value.trim() === "") {
                    ngModel.$setValidity("durationRange", true);
                    ngModel.$setValidity("validDuration", true);
                    return null;
                }

                var duration = splitUtilities.parseSplit(value.trim());
                if (!duration) {
                    ngModel.$setValidity("durationRange", false);
                    ngModel.$setValidity("validDuration", false);
                    return null;
                }
                ngModel.$setValidity("validDuration", true);

                var validRange = true;
                if (duration.asMinutes() > 3 || duration.asMinutes() < 1) {
                    validRange = false;
                }
                ngModel.$setValidity("durationRange", validRange);

                return duration;
            });
        }
    }
});