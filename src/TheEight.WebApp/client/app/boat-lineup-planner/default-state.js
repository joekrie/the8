import { Map, List } from "immutable";

import EventDetailsRecord from "./models/event-details-record";

const defaultState = {
    eventSettings: new EventDetailsRecord(),
    boats: Map(),
    attendees: List()
};

export default defaultState