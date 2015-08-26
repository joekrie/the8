function formatSplit(duration) {
    var split = "";
    split += duration.minutes() + ":";

    if (duration.seconds() < 10) {
        split += "0";
    }

    var seconds = duration.seconds();
    var deciseconds = Math.round(duration.milliseconds() / 100);
    split += `${seconds}.${deciseconds}`;

    return split;
}
function parseSplit(split) {
    var regExp = XRegExp("^(?<minutes>\\d):(?<seconds>[0-5][0-9])(.(?<secondFraction>\\d*)?)?$");
    var res = XRegExp.exec(split, regExp);

    if (!res) {
        return null;
    }

    var secondsDecimel = parseFloat(`0.${res.secondFraction}`);
    var milliseconds = secondsDecimel * 1000;

    return moment.duration({
        minutes: res.minutes,
        seconds: res.seconds,
        milliseconds: milliseconds
    });
}
angular.module("shared", []);
angular.module("coachResultSubmitter", ["shared"]);
angular.module("rowerResultSubmitter", ["shared"]);
angular.module("workoutBuilder", ["shared", "as.sortable"]);
angular.module("coachResultSubmitter")
	.controller("MainCtrl", ["$scope", "dataService", function ($scope, dataService) {
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
angular.module("rowerResultSubmitter")
	.controller("MainCtrl", ["$scope", "$window", function ($scope, $window) {
	    //var workout = dataService.getWorkout("workouts/1");

	    $scope.workoutInfo = workout.workoutInfo;
	    $scope.rowerInfo = workout.rowerInfo;
	    $scope.pieceResults = workout.pieceResults;

	    $scope.saveResults = function () {
	        $window.location.href = "";
	    }
	}]);
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
angular.module("shared")
    .directive("the8Datepicker", [
        function() {
            return {
                restrict: "A",
                require: "ngModel",
                scope: {
                    "ngModel": "="
                },
                link: function (scope, element, attr, ngModel) {
                    var dateFormat = "YYYY-MM-DD";

                    ngModel.$formatters.push(function(value) {
                        return moment(value).toDate();
                    });

                    if (!Modernizr.inputtypes.date) {
                        var datepicker = rome(element[0], {
                            time: false
                        });
                        
                        datepicker.on("data", function (data) {
                            var currVal = moment(scope.ngModel);
                            var newVal = moment(data);
                            var valsSame = currVal.isSame(newVal, "day");

                            if (valsSame) {
                                return;
                            }
                            
                            scope.$apply(function() {
                                scope.ngModel = moment(data).format(dateFormat);
                                ngModel.$setDirty();
                            });
                        });

                        scope.$watch("ngModel", function (newValue) {
                            datepicker.setValue(newValue);
                        });
                    }
                }
            };
        }
    ]);
angular.module("shared")
    .directive("the8Spinner", [function() {
        return {
            restrict: "A",
            require: "ngModel",
            scope: {
                "ngModel": "="
            },
            link: function (scope, element, attr, ngModel) {
                scope.$watch("ngModel", function (newValue) {
                    
                });
            }
        }
    }]);
angular.module("shared")
    .directive("the8Split", [
        function() {
            return {
                restrict: "A",
                require: "ngModel",
                scope: {
                    ngModel: "="
                },
                link: function(scope, element, attr, ngModel) {
                    ngModel.$formatters.push(function(value) {
                        return formatSplit(value);
                    });

                    ngModel.$parsers.push(function(value) {
                        if (value.trim() === "") {
                            ngModel.$setValidity("durationRange", true);
                            ngModel.$setValidity("validDuration", true);
                            return null;
                        }

                        var duration = parseSplit(value.trim());
                        if (!duration) {
                            ngModel.$setValidity("durationRange", false);
                            ngModel.$setValidity("validDuration", false);
                            return null;
                        }
                        ngModel.$setValidity("validDuration", true);

                        var validRange = true;
                        if (duration.asMinutes() > 3 || duration.asMinutes() < 1) {
                            validRange = false;
                        }
                        ngModel.$setValidity("durationRange", validRange);

                        return duration;
                    });
                }
            };
        }
    ]);
angular.module("shared")
	.directive("the8StrokeRate", [function () {
	    return {
	        restrict: "A",
	        require: "ngModel",
	        scope: {
	            ngModel: "="
	        },
	        link: function (scope, element, attr, ngModel) {
	            ngModel.$parsers.push(function (value) {
	                if (value.trim() === "") {
	                    ngModel.$setValidity("integer", true);
	                    return null;
	                }

	                function isInt(n) {
	                    return String(parseInt(n)) === n;
	                }
	                var validInt = isInt(value.trim());

	                ngModel.$setValidity("integer", validInt);
	                var strokeRate = validInt ? parseInt(value) : null;

	                if (validInt) {
	                    var inRange = strokeRate >= 10 && strokeRate < 60;
	                    ngModel.$setValidity("range", inRange);
	                } else {
	                    ngModel.$setValidity("range", false);
	                }

	                return strokeRate;
	            });
	        }
	    };
	}]);
angular.module("shared")
    .filter("pieceInfo", function() {
        return function(pieceInfo) {
            return pieceInfo.magnitude + " " + pieceInfo.unit;
        }
    });
angular.module("shared")
    .filter("split", function() {
        return function(duration) {
            if (duration) {
                return formatSplit(duration);
            }

            return "";
        };
    });