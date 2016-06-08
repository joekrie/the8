import { Map, List } from "immutable";

import EventDetailsRecord from "../common/models/event-details-record";

const defaultState = {
    eventDetails: new EventDetailsRecord(),
    boats: Map(),
    attendees: List()
};

export default defaultState