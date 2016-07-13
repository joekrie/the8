import { Record } from "immutable"

import AttendeeDetailsRecord from "./attendee-details-record"

const AttendeeRecord = Record({
  details: new AttendeeDetailsRecord(),
  isSaving: false
})

export default AttendeeRecord
