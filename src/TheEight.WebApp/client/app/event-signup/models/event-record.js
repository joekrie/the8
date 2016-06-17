import { Record } from "immutable";
import { LocalDate } from "js-joda";

import { WATER_EVENT } from "./event-types";

const EventRecord = Record({
    eventId: "",
    date: LocalDate.of(1900, 1, 1),
    notes: "",
    type: WATER_EVENT
});

export default EventRecord