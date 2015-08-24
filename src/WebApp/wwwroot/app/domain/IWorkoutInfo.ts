module app.domain {
    export interface IWorkoutInfo {
        title: string;
        comments: string;
        date: moment.Moment;
    }
}