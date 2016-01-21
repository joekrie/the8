import { createAction, handleActions } from "redux-actions";
import Immutable from "immutable";
import assignAttendee from "./reducers/assignAttendee";
import unassignAttendee from "./reducers/unassignAttendee";
import moveAttendee from "./reducers/moveAttendee";

const defaultState = {
    event: Immutable.fromJS({
        settings: {
            allowMultipleAssignments: false
        },
        attendees: [],
        boats: []
    })
};

export const reducer = handleActions({
    ASSIGN_ATTENDEE: assignAttendee,
    UNASSIGN_ATTENDEE: unassignAttendee,
    MOVE_ATTENDEE: moveAttendee
}, defaultState);

export const actionCreators = {
    assignAttendee: createAction("ASSIGN_ATTENDEE"),
    unassignAttendee: createAction("UNASSIGN_ATTENDEE"),
    moveAttendee: createAction("MOVE_ATTENDEE")
};