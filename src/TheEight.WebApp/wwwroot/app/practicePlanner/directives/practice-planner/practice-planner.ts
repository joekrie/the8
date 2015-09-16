angular.module("the8.practicePlanner")
    .directive("the8PracticePlanner", [
        "dragularService", dragularService => {
            return {
                controller: PracticePlannerCtrl
            }
        }
    ]);

export class PracticePlannerCtrl {
    static $inject = ["$scope", "dragularService"];

    constructor(public $scope: angular.IScope, public dragularService) { }
    
    registerBoatSeat(directiveElement: angular.IAugmentedJQuery) {
        this.dragularService([directiveElement], {
            allow: (element: HTMLElement, target: HTMLElement, source: HTMLElement, sibling: HTMLElement) => true
        });
    }

    registerUnassignedList(directiveElement: angular.IAugmentedJQuery) {
        this.dragularService([directiveElement], {
            allow: (element: HTMLElement, target: HTMLElement, source: HTMLElement, sibling: HTMLElement) => true
        });
    }
}