angular.module("rowerResultSubmitter")
	.factory("dataService", ["ajaxService", function (ajaxService) {
	    return {
            getWorkout: function(workoutId) {
                return {
                    workoutInfo: {
                        workoutId: "workouts/1",
                        title: "6 x 500m",
                        comments: "Sprints!",
                        date: moment([2015, 10, 11]).toDate()
                    },
                    pieceResults: [
                        {
                            pieceInfo: {
                                magnitude: 500,
                                unit: "meters"
                            },
                            splitResult: moment.duration({
                                minutes: 1,
                                seconds: 50
                            }),
                            strokeRate: 25
                        },
                        {
                            pieceInfo: {
                                magnitude: 500,
                                unit: "meters"
                            },
                            splitResult: moment.duration({
                                minutes: 1,
                                seconds: 50
                            }),
                            strokeRate: 26
                        }
                    ]
                }
            }
        }
    }]);