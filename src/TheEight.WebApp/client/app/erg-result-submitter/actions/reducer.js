import { handleActions } from 'redux-actions';
import emptyState from '../constants/emptyState';
import emptyAttendeePlacement from '../constants/emptyAttendeePlacement';

function assignAttendee(state, action) {
    const { attendeeId, boatKey, seatPosition } = action.payload;
    const boatKeyPath = ['attendees', attendeeId, 'placement', 'boatKey'];
    const seatPath = ['attendees', attendeeId, 'placement', 'seat'];

    return state
        .setIn(boatKeyPath, boatKey)
        .setIn(seatPath, seatPosition);
}

function unassignAttendee(state, action) {
    const { attendeeId } = action.payload;
    const placementPath = ['attendees', attendeeId, 'placement'];

    return state
        .setIn(placementPath, emptyAttendeePlacement);
}

export default handleActions({
    ASSIGN_ATTENDEE: assignAttendee
    UNASSIGN_ATTENDEE: unassignAttendee
}, emptyState);