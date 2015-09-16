angular.module("the8.workoutTracker")
    .directive("the8-team-workout-submitter", [() => {
        return {
            controller: $scope => {
                $scope.WorkoutInfo = {};
                $scope.rowers = [];
                $scope.pieces = [];

                $scope.activePiece = {
                    index: 0,
                    getActivePiece: () => $scope.pieces[$scope.activePiece.index],
                    getIndexPieceDisplay: () => {
                        const curr = $scope.activePiece.index + 1;
                        const total = $scope.pieces.length;
                        return String(curr) + " of " + String(total);
                    },
                    goToNext: () => $scope.activePiece.index++,
                    goToPrevious: () => $scope.activePiece.index--,
                    checkCanGoToNext: () => $scope.activePiece.index + 1 < $scope.pieces.length,
                    checkCanGoToPrevious: () => $scope.activePiece.index - 1 >= 0
                };

                $scope.rowerDisplay = {
                    rowers: _.sortBy($scope.rowers, "sortName"),
                    getPredicate: result => _.findIndex($scope.rowerDisplay.rowers,
                        rower => result.rowerId === rower.rowerId)
                };
            }
        };
    }]);