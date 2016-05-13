import { handleActions } from "redux-actions";
import { Map, List } from "immutable";

import { ASSIGN_ATTENDEE_TO_SEAT, UNASSIGN_ATTENDEE_IN_SEAT } from "./actions";
import { defaultState } from "./default-state";
import { assignAttendeeToSeat, unassignAttendeeInSeat } from "./reducer-functions";

const reducer = handleActions({
    [ASSIGN_ATTENDEE_TO_SEAT]: assignAttendeeToSeat,
    [UNASSIGN_ATTENDEE_IN_SEAT]: unassignAttendeeInSeat
}, defaultState);

export default reducer