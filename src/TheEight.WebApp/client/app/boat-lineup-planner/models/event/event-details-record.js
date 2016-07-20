import { Record } from "immutable"
import { LocalDate } from "js-joda"

import * as EventModes from "./event-modes"

const EventDetailsRecord = Record({
    eventId: "",
    date: LocalDate.of(1900, 1, 1),
    notes: "",
    mode: EventModes.PRACTICE_MODE
})

export default EventDetailsRecord
