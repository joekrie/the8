import { createAction, handleActions } from "redux-actions";
import Immutable from "immutable";
import assignAttendee from "./reducers/assignAttendee";
import unassignAttendee from "./reducers/unassignAttendee";

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
    UNASSIGN_ATTENDEE: unassignAttendee
}, defaultState);

export const actionCreators = {
    assignAttendee: createAction("ASSIGN_ATTENDEE"),
    unassignAttendee: createAction("UNASSIGN_ATTENDEE")
};