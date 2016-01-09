import { createAction, handleActions } from 'redux-actions';
import emptyState from './defaults/emptyState';
import emptyAttendeePlacement from '../constants/emptyAttendeePlacement';

export const reducer = handleActions({
    ASSIGN_ATTENDEE: function assignAttendee(state, action) {
        state.setIn(['attendees', action.payload.attendeeId, 'placement', 'boatKey'], action.payload.boatKey)
            .setIn(['attendees', action.payload.attendeeId, 'placement', 'seat'], action.payload.seatPosition);
    },
    UNASSIGN_ATTENDEE: function unassignAttendee(state, action) {
        state.setIn(['attendees', action.payload.attendeeId, 'placement'], emptyAttendeePlacement);
    }
}, emptyState);

export const actionCreators = {
    assignAttendee: createAction('ASSIGN_ATTENDEE'),
    unassignAttendee: createAction('UNASSIGN_ATTENDEE')
};