import actionTypes from './actionTypes';
import fakeInitialState from '../fakeInitialState';
import emptyAttendeePlacement from '../constants/emptyAttendeePlacement';

export default function(state = fakeInitialState, action) {
	switch (action.type) {
		case actionTypes.UNASSIGN_ATTENDEE:
			return state
				.setIn(['attendees', action.attendeeId, 'placement'], emptyAttendeePlacement);
		case actionTypes.ASSIGN_ATTENDEE:
			return state
				.setIn(['attendees', action.attendeeId, 'placement', 'boatKey'], action.boatKey)
				.setIn(['attendees', action.attendeeId, 'placement', 'seat'], action.seatPosition);
		default:
			return state;
	}
}