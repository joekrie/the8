import practicePlannerCtrl = require("PracticePlannerCtrl");

angular.module("the8.practicePlanner")
    .directive("the8PracticePlanner", [
        "dragularService", dragularService => {
            return {
                controller: practicePlannerCtrl.PracticePlannerCtrl
            }
        }
    ]);