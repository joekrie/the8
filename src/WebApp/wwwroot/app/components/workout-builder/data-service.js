angular.module("workoutBuilder")
	.factory("dataService", ["ajaxService", function (ajaxService) {
	    return {
	        getWorkout: function (workoutId) {
	            return {
	                workoutId: workoutId,
	                title: "6 x 500m",
	                comments: "Sprints!",
	                date: moment([2015, 10, 11]).toDate(),
	                pieces: [
						{
						    magnitude: 500,
						    unit: "meters"
						},
						{
						    magnitude: 500,
						    unit: "meters"
						},
						{
						    magnitude: 500,
						    unit: "meters"
						},
						{
						    magnitude: 500,
						    unit: "meters"
						},
						{
						    magnitude: 500,
						    unit: "meters"
						},
						{
						    magnitude: 500,
						    unit: "meters"
						}
	                ]
	            }
	        }
	    }
	}]);