angular.module("shared")
    .directive("the8Datepicker", [
        function() {
            return {
                restrict: "A",
                require: "ngModel",
                scope: {
                    ngModel: "="
                },
                link: function(scope, element, attr, ngModel) {
                    if (!Modernizr.inputtypes.date) {
                        var datepicker = rome(element[0], {
                            time: false,
                            intialValue: moment(scope.ngModel)
                        });

                        var initialValue = scope.ngModel;
                        datepicker.setValue(initialValue);

                        datepicker.on("data", function(data) {
                            scope.$apply(function() {
                                scope.ngModel = moment(data).toDate();
                            });
                        });

                        scope.$watch(scope.ngModel, function(newValue) {
                            datepicker.setValue(newValue);
                        });
                    }
                }
            };
        }
    ]);