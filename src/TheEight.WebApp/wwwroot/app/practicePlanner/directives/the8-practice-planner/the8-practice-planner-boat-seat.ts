angular.module("the8.practicePlanner")
    .directive("the8PracticePlannerBoatSeat", [
        "dragularService", dragularService => {
            return {
                require: "ngModel",
                link: (scope: angular.IScope, element: angular.IAugmentedJQuery, attr: angular.IAttributes, ngModel: angular.INgModelController) => {
                    dragularService([element], {
                        containersModel: ngModel,
                        allow: () => ngModel.$modelValue.length === 0
                    });
                }
            }
        }
    ]);

class BoatSeatCtrl {
    
}