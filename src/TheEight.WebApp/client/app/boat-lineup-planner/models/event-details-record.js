import { Record } from "immutable";

import { PRACTICE_MODE } from "./event-modes";

const EventInfoRecord = Record({
    eventId: "",
    title: "",
    mode: PRACTICE_MODE
});

export default EventInfoRecord