import { Map, List } from "immutable";

import { placeAttendees } from "./reducer-functions";
import EventInfoRecord from "./records/event-info";

const defaultState = {
    eventSettings: new EventInfoRecord(),
    boats: Map(),
    attendees: List()
};

export default defaultState