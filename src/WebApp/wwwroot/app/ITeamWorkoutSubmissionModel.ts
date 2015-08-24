interface ITeamWorkoutSubmissionModel {
    workoutId: string;
    workout: WorkoutInfo;
    rowers: { [rowerId: string]: RowerInfo };
    results: { [pieceOrder: number]: TeamPieceResults };
}