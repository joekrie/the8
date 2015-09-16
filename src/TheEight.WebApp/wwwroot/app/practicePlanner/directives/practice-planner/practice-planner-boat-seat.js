angular.module("the8.practicePlanner")
    .directive("the8PracticePlannerBoatSeat", () => {
        return {
            require: "^the8PracticePlanner",
            link: (scope, element, attr, practicePlannerCtrl) => {
                practicePlannerCtrl.registerBoatSeat(element);
            }
        }
    });