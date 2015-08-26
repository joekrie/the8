module app.domain {
    export interface IndividualWorkoutSubmission {
        workoutId: string;
        workout: WorkoutInfo;
        rower: IRowerInfo;
        results: { [pieceOrder: number]: IResult };
    }
}