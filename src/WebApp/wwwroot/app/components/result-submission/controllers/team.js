angular.module("resultSubmission")
	.controller("TeamCtrl", ["$scope", "dataService", function ($scope, dataService) {
        var workout = dataService.getWorkout("workouts/1");

	    $scope.workoutInfo = workout.workoutInfo;
	    $scope.pieceResults = workout.pieceResults;

	    $scope.rowersInOrder = _.sortBy(workout.rowers, "sortName");
	    $scope.rowerOrderPredicate = function (result) {
	        return _.findIndex($scope.rowersInOrder, function (rower) {
	            return result.rowerInfo.rowerId === rower.rowerId;
	        });
	    };

	    $scope.activePieceIndex = 0;
	    $scope.getActivePiece = function () {
	        return $scope.pieceResults[$scope.activePieceIndex];
	    };
	    $scope.getActivePieceDisplay = function () {
	        return String($scope.activePieceIndex + 1) + " of " + $scope.pieceResults.length;
	    }

	    $scope.goToNextPiece = function () {
	        $scope.activePieceIndex++;
	    };
	    $scope.checkGoToNextPieceDisabled = function () {
	        return $scope.activePieceIndex + 1 >= $scope.pieceResults.length;
	    };

	    $scope.goToPreviousPiece = function () {
	        $scope.activePieceIndex--;
	    };
	    $scope.checkGoToPreviousPieceDisabled = function () {
	        return $scope.activePieceIndex - 1 < 0;
	    };

	    $scope.saveResults = function () {
	        console.log($scope.pieceResults);
	    }
	}]);