import { Record } from "immutable"

import EventDetailsRecord from "./event-details-record"

const EventStateRecord = Record({
    details: new EventDetailsRecord(),
    isLoaded: false,
    isLoading: false,
    isSaving: false
})

export default EventStateRecord
