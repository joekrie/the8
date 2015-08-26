module app.workoutBuilder {
    export interface IWorkoutBuilderModel {
        workout: domain.IWorkoutInfo;
        pieces: domain.IPieceInfo[];
    }
}