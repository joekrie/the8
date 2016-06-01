import { handleActions } from "redux-actions";
import { Map, List } from "immutable";

import { ASSIGN_ATTENDEE, UNASSIGN_ATTENDEE } from "./actions";
import { defaultState } from "./default-state";
import { assignAttendee, unassignAttendee } from "./reducer-functions";

const reducer = handleActions({
    [ASSIGN_ATTENDEE]: assignAttendee,
    [UNASSIGN_ATTENDEE]: unassignAttendee
}, defaultState);

export default reducer