angular.module("rowerResultSubmitter")
	.controller("MainCtrl", ["$scope", "dataService", "$window", function ($scope, dataService, $window) {
	    var workout = dataService.getWorkout("workouts/1");

	    $scope.workoutInfo = workout.workoutInfo;
	    $scope.rowerInfo = workout.rowerInfo;
	    $scope.pieceResults = workout.pieceResults;

	    $scope.saveResults = function () {
	        $window.location.href = "";
	    }
	}]);