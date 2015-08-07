angular.module("workoutBuilder")
	.controller("MainCtrl", ["$scope", "dataService", function ($scope, dataService) {
	    $scope.workout = dataService.getWorkout("workouts/1");

	    $scope.removePiece = function (piece) {
	        var index = $scope.workout.pieces.indexOf(piece);
	        $scope.workout.pieces.splice(index, 1);
	    };

	    $scope.addPiece = function () {
	        $scope.workout.pieces.push({
	            magnitude: null,
	            unit: "meters"
	        });
	    };

	    $scope.saveWorkout = function () {
	        console.log($scope.workout);
	    };

	    $scope.sortableOptions = {};
	}]);