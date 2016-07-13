import { Record } from "immutable"

import EventStateRecord from "./event-state-record"

const EventStateRecord = Record({
    details: new EventDetailsRecord(),
    isLoaded: false,
    isLoading: false,
    isSaving: false
})

export default EventStateRecord
