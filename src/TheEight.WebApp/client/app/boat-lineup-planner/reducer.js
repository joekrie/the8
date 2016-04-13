import { handleActions } from "redux-actions";
import defaultState from "./defaultState";
import * as reducerFunctions from "./reducerFunctions";

export default handleActions({
    PLACE_ATTENDEES: reducerFunctions.placeAttendees,
    REPLACE_STATE: reducerFunctions.replaceState
}, defaultState);