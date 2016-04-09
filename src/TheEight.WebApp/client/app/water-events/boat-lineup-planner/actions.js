import { placeAttendee } from "./reducers/placeAttendee";
import unplaceAttendee from "./reducers/unplaceAttendee";

export default [
    {
        actionType: "UNPLACE_ATTENDEE",
        actionCreatorName: "unplaceAttendee",
        reducer: unplaceAttendee
    }
];