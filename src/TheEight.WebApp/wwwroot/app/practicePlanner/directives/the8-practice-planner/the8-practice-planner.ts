angular.module("the8.practicePlanner")
    .directive("the8PracticePlanner", [
        "dragularService", dragularService => {
            return {
                controller: ["$scope", $scope => {
                    $scope.registerBoatSeat = (element, model) => {
                        dragularService([element], {
                            containersModel: model,
                            allow: () => model.length === 0
                        });
                    }
                }],
                link: (scope, element, attr) => {

                }
            }
        }
    ]);