module app.workoutBuilder {
    class WorkoutBuilderCtrl implements IWorkoutBuilderModel {
        workout: domain.IWorkoutInfo;
        pieces: domain.IPieceInfo[];


    }

    angular.module("app.workoutBuilder").controller("WorkoutBuilderCtrl", WorkoutBuilderCtrl);
}


angular.module("workoutBuilder")
    .controller("MainCtrl", [
        "$scope", "$http", "$attrs", function ($scope, $http, $attrs) {
            $scope.dataLoaded = false;

            $http.get($attrs.getUrl)
                .then(function(response) {
                    $scope.workout = response.data;
                    $scope.dataLoaded = true;
                });

            $scope.removePiece = function(piece) {
                var index = $scope.workout.pieces.indexOf(piece);
                $scope.workout.pieces.splice(index, 1);
            };

            $scope.addPiece = function() {
                $scope.workout.pieces.push({
                    magnitude: null,
                    unit: "meters"
                });
            };

            $scope.saveWorkout = function() {
                $http({
                        url: $attrs.saveUrl,
                        method: "POST",
                        data: $scope.workout
                    })
                    .then(function(response) {
                        console.log(response);
                    });
            };

            $scope.deleteWorkout = function() {
                $http({
                    url: $attrs.deleteUrl,
                    method: "POST",
                    data: {
                        workoutId: $scope.workout.workoutId,
                        forceDeleteIfResults: $scope.workout.forceSaveIfResults
                    }
                });
            };

            $scope.sortableOptions = {};
        }
    ]);