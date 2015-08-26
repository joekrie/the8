module app.Submission {


    class TeamWorkoutSubmissionCtrl implements ITeamWorkoutSubmissionModel {
        static $inject: string[] = [];

        workoutId: string;
        workout: WorkoutInfo;
        rowers: { [index: string]: RowerInfo; };
        results: { [index: number]: TeamPieceResults; };

        constructor() {
            this.workoutId = "workouts/1";
        }
    }

    angular.module("app").controller("TeamWorkoutSubmissionController", TeamWorkoutSubmissionCtrl);
}