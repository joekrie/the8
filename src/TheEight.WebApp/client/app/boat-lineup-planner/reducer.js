import { handleActions } from "redux-actions";
import { Map, List } from "immutable";

import { placeAttendees } from "./reducer-functions";
import WaterEventRecord from "./water-event.record";

const defaultState = {
    eventSettings: new WaterEventRecord(),
    boats: Map(),
    attendees: List()
};

const reducer = handleActions({
    PLACE_ATTENDEES: placeAttendees,
}, defaultState);

export { defaultState }
export default reducer