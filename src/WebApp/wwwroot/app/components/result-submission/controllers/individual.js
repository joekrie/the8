angular.module("resultSubmission")
	.controller("IndividualCtrl", ["$scope", "$window", function ($scope, $window) {

	    $scope.workoutInfo = workout.workoutInfo;
	    $scope.rowerInfo = workout.rowerInfo;
	    $scope.pieceResults = workout.pieceResults;

	    $scope.saveResults = function () {
	        $window.location.href = "";
	    }
	}]);