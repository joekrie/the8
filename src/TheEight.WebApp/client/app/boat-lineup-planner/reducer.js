import { handleActions } from "redux-actions";
import { Map, List } from "immutable";

import { defaultState } from "./default-state";
import { placeAttendees } from "./reducer-functions";

const reducer = handleActions({
    PLACE_ATTENDEES: placeAttendees
}, defaultState);

export default reducer