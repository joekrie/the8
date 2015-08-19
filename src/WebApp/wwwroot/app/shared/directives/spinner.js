angular.module("shared")
    .directive("the8Spinner", [function() {
        return {
            restrict: "A",
            require: "ngModel",
            scope: {
                "ngModel": "="
            },
            link: function (scope, element, attr, ngModel) {
                scope.$watch("ngModel", function (newValue) {
                    
                });
            }
        }
    }]);