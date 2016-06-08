import { Record } from "immutable";

const EventRecord = Record({
    eventId: "",
    date: new Date(1900, 0, 1),
    notes: ""
});

export default EventRecord