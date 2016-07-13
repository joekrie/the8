import { Record } from "immutable"

import AttendeeRecord from "./attendee-record"

const AttendeeListItemRecord = Record({
    attendee: new AttendeeRecord(),
    isAssigned: false
})

export default AttendeeListItemRecord
