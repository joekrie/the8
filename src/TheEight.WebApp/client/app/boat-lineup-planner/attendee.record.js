import { Record } from "immutable";

const AttendeeRecord = Record({
    attendeeId: "",
    displayName: "",
    sortName: "",
    isCoxswain: false
});

export default AttendeeRecord