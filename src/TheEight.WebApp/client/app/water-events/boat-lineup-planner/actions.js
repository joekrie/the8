import { createAction, handleActions } from "redux-actions";
import Immutable from "immutable";

function assignAttendee(state, action) {
    state.setIn(["attendees", action.payload.attendeeId, "placement", "boatKey"], action.payload.boatKey)
        .setIn(["attendees", action.payload.attendeeId, "placement", "seat"], action.payload.seatPosition);
}

function unassignAttendee(state, action) {
    const emptyAttendeePlacement = Immutable.fromJS({
        boatKey: "",
        seat: ""
    });

    state.setIn(["attendees", action.payload.attendeeId, "placement"], emptyAttendeePlacement);
}

const defaultState = {
    attendees: Immutable.Map(),
    boats: Immutable.Map()
};

export const reducer = handleActions({
    ASSIGN_ATTENDEE: assignAttendee,
    UNASSIGN_ATTENDEE: unassignAttendee
}, defaultState);

export const actionCreators = {
    assignAttendee: createAction("ASSIGN_ATTENDEE"),
    unassignAttendee: createAction("UNASSIGN_ATTENDEE")
};