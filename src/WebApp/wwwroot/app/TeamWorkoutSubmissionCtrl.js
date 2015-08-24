var app;
(function (app) {
    var Submission;
    (function (Submission) {
        var TeamWorkoutSubmissionCtrl = (function () {
            function TeamWorkoutSubmissionCtrl() {
                this.workoutId = "workouts/1";
            }
            TeamWorkoutSubmissionCtrl.$inject = [];
            return TeamWorkoutSubmissionCtrl;
        })();
        angular.module("app").controller("TeamWorkoutSubmissionController", TeamWorkoutSubmissionCtrl);
    })(Submission = app.Submission || (app.Submission = {}));
})(app || (app = {}));
