import { handleActions } from 'redux-actions';
import * as actionTypes from './actionTypes';
import emptyState from '../constants/emptyState';
import emptyAttendeePlacement from '../constants/emptyAttendeePlacement';

const reducers = {};

reducers[actionTypes.ASSIGN_ATTENDEE] = (state, action) =>
    state.setIn(['attendees', action.payload.attendeeId, 'placement', 'boatKey'], action.payload.boatKey)
        .setIn(['attendees', action.payload.attendeeId, 'placement', 'seat'], action.payload.seatPosition);

reducers[actionTypes.UNASSIGN_ATTENDEE] = (state, action) =>
    state.setIn(['attendees', action.payload.attendeeId, 'placement'], emptyAttendeePlacement);

export default handleActions(reducers, emptyState);