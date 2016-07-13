import { Record, List } from "immutable"

const AttendeeStateRecord = Record({
    attendees: List(),
    isLoaded: false,
    isLoading: false
})

export default AttendeeStateRecord
