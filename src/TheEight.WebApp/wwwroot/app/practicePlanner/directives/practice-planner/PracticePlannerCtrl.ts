export class PracticePlannerCtrl {
    static $inject = ["$scope", "dragularService"];
    
    private boatSeatElements: HTMLElement[] = [];
    private unassignedListElement: HTMLElement;
    
    constructor(public $scope: angular.IScope, public dragularService) {
        this.$scope.$on("dragulardrop", this.onDrop);
    }

    registerBoatSeat(directiveElement: angular.IAugmentedJQuery) {
        this.boatSeatElements.push(directiveElement[0]);

        this.dragularService([directiveElement[0]], {
            scope: this.$scope,
            allow: this.allowDrop
        });
    }

    registerUnassignedList(directiveElement: angular.IAugmentedJQuery) {
        this.unassignedListElement = directiveElement[0];

        this.dragularService([directiveElement[0]], {
            scope: this.$scope,
            allow: this.allowDrop,
            revertOnSpill: true
        });
    }

    private onDrop(event: angular.IAngularEvent, element: HTMLElement, target: HTMLElement, source: HTMLElement) {
        const targetContainerType = this.getDropContainerType(target);
        
    }
    
    private getDropContainerType(element: HTMLElement): DropContainerType {
        if (this.boatSeatElements.indexOf(element) > 0) {
            return DropContainerType.BoatSeat;
        }

        if (this.unassignedListElement === element) {
            return DropContainerType.UnassignedList;
        }

        return DropContainerType.Invalid;
    }

    private checkBoatSeatFilled(element: HTMLElement): boolean {
        const angularElem = angular.element(element);
        return false;
    }

    private allowDrop(element: HTMLElement, target: HTMLElement, source: HTMLElement, sibling: HTMLElement): boolean {
        if (source === target) {
            return false;
        }
        
        const targetContainerType = this.getDropContainerType(target);

        if (targetContainerType === DropContainerType.BoatSeat) {
            return !this.checkBoatSeatFilled(target);
        }

        if (targetContainerType === DropContainerType.UnassignedList) {
            return true;
        }

        return false;
    }
}

enum DropContainerType {
    Invalid,
    BoatSeat,
    UnassignedList
}