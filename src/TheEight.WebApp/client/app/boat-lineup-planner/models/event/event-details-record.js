import { Record } from "immutable"
import { LocalDate } from "js-joda"

import { PRACTICE_MODE } from "./event-modes"

const EventDetailsRecord = Record({
    eventId: "",
    date: LocalDate.of(1900, 1, 1),
    notes: "",
    mode: PRACTICE_MODE
})

export default EventDetailsRecord
