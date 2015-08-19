angular.module("shared")
    .directive("the8Datepicker", [
        function() {
            return {
                restrict: "A",
                require: "ngModel",
                scope: {
                    "ngModel": "="
                },
                link: function (scope, element, attr, ngModel) {
                    var dateFormat = "YYYY-MM-DD";

                    ngModel.$formatters.push(function(value) {
                        return moment(value).toDate();
                    });

                    if (!Modernizr.inputtypes.date) {
                        var datepicker = rome(element[0], {
                            time: false
                        });
                        
                        datepicker.on("data", function (data) {
                            var currVal = moment(scope.ngModel);
                            var newVal = moment(data);
                            var valsSame = currVal.isSame(newVal, "day");

                            if (valsSame) {
                                return;
                            }
                            
                            scope.$apply(function() {
                                scope.ngModel = moment(data).format(dateFormat);
                                ngModel.$setDirty();
                            });
                        });

                        scope.$watch("ngModel", function (newValue) {
                            datepicker.setValue(newValue);
                        });
                    }
                }
            };
        }
    ]);