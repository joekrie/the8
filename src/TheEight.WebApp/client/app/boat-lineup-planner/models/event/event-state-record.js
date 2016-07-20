import { Record } from "immutable"

const EventStateRecord = Record({
    details: new EventDetailsRecord(),
    isLoaded: false,
    isLoading: false,
    isSaving: false
})

export default EventStateRecord
