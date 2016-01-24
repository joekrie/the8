import { createAction, handleActions } from "redux-actions";
import Immutable from "immutable";
import placeAttendee from "./reducers/placeAttendee";
import unplaceAttendee from "./reducers/unplaceAttendee";

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
    PLACE_ATTENDEE: placeAttendee,
    UNPLACE_ATTENDEE: unplaceAttendee
}, defaultState);

export const actionCreators = {
    placeAttendee: createAction("PLACE_ATTENDEE"),
    unplaceAttendee: createAction("UNPLACE_ATTENDEE")
};