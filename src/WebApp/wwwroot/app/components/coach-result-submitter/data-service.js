angular.module("coachResultSubmitter")
	.factory("dataService", ["ajaxService", function (ajaxService) {
	    return {
	        getWorkout: function (workoutId) {
	            return {
	                workoutInfo: {
	                    workoutId: workoutId,
	                    title: "6 x 500m",
	                    comments: "Sprints!",
	                    date: moment([2015, 10, 11]).toDate()
	                },
	                rowers: {
						"rowers/1": {
						    displayName: "Aladdin",
						    sortName: "Aladdin"
						},
						"rowers/2": {
						    displayName: "Goofy",
						    sortName: "Goofy"
						}
	                },
	                pieceResults: [
						{
						    pieceInfo: {
						        magnitude: 500,
						        unit: "meters"
						    },
						    results: [
								{
								    rowerId: "rowers/1",
								    rowerInfo: {
								        displayName: "Aladdin",
								        sortName: "Aladdin"
								    },
								    splitResult: moment.duration({
								        minutes: 1,
								        seconds: 50
								    }),
								    strokeRate: 28
								},
								{
								    rowerId: "rowers/2",
								    rowerInfo: {
								        displayName: "Goofy",
								        sortName: "Goofy"
								    },
								    splitResult: moment.duration({
								        minutes: 1,
								        seconds: 45
								    }),
								    strokeRate: 29
								}
						    ]
						},
						{
						    pieceInfo: {
						        magnitude: 20,
						        unit: "minutes"
						    },
						    results: [
								{
								    rowerId: "rowers/2",
								    rowerInfo: {
								        displayName: "Goofy",
								        sortName: "Goofy"
								    },
								    splitResult: moment.duration({
								        minutes: 2,
								        seconds: 2
								    }),
								    strokeRate: 22
								},
								{
								    rowerId: "rowers/1",
								    rowerInfo: {
								        displayName: "Aladdin",
								        sortName: "Aladdin"
								    },
								    splitResult: moment.duration({
								        minutes: 1,
								        seconds: 59
								    }),
								    strokeRate: 23
								}
						    ]
						}
	                ]
	            }
	        }
	    }
	}]);