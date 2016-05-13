import { Record } from "immutable";

import AttendeeRecord from "./attendee";

const AttendeeListItemRecord = Record({
    attendee: new AttendeeRecord(),
    isAssigned: false
});

export default AttendeeListItemRecord