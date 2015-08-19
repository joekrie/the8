angular.module("practicePlanner")
    .directive("the8Boat", [
        function () {
            return {
                restrict: "E",
                require: "ngModel",
                scope: {
                    "ngModel": "="
                },
                link: function (scope, element, attr, ngModel) { }
            };
        }
    ]);