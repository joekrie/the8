import { Map, List } from "immutable";

import EventInfoRecord from "./models/event-info";

const defaultState = {
    eventSettings: new EventInfoRecord(),
    boats: Map(),
    attendees: List()
};

export default defaultState