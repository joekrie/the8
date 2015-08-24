angular.module("shared")
    .directive("the8Split", [
        function() {
            return {
                restrict: "A",
                require: "ngModel",
                scope: {
                    ngModel: "="
                },
                link: function(scope, element, attr, ngModel) {
                    ngModel.$formatters.push(function(value) {
                        return formatSplit(value);
                    });

                    ngModel.$parsers.push(function(value) {
                        if (value.trim() === "") {
                            ngModel.$setValidity("durationRange", true);
                            ngModel.$setValidity("validDuration", true);
                            return null;
                        }

                        var duration = parseSplit(value.trim());
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
            };
        }
    ]);