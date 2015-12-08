import initialState from './fakeInitialState';
import emptyAttendeePlacement from '../constants/emptyAttendeePlacement';
import { handleActions } from 'redux-actions';

function assignAttendee(state, action) {
    state.setIn(['attendees', action.payload.attendeeId, 'placement', 'boatKey'], action.payload.boatKey)
        .setIn(['attendees', action.payload.attendeeId, 'placement', 'seat'], action.payload.seatPosition);
}

function unassignAttendee(state, action) {
    state.setIn(['attendees', action.payload.attendeeId, 'placement'], emptyAttendeePlacement);
}

export default handleActions({
    ASSIGN_ATTENDEE: assignAttendee,
    UNASSIGN_ATTENDEE: unassignAttendee 
}, initialState);