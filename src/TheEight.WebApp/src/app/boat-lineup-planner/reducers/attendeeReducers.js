import actionTypes from '../actions/actionTypes';
import fakeInitialState from '../fakeInitialState';

export default function(state = fakeInitialState, action) {
	switch (action.type) {
		case actionTypes.ASSIGN_ATTENDEE:
			return state
				.setIn(['boats', action.newBoatKey, 'seats', action.newPosition], action.attendee)
				.deleteIn(['unassignedAttendees', action.attendee.get('id')]);
		case actionTypes.UNASSIGN_ATTENDEE:
			return state
				.setIn(['boats', action.oldBoatKey, 'seats', action.oldPosition], null)
				.setIn(['unassignedAttendees', action.attendee.get('id')], action.attendee);
		case actionTypes.MOVE_ATTENDEE:
			const oldAttendee = state.getIn(['boats', newBoatKey, 'seats', newPosition]);
			return state
				.setIn(['boats', action.oldBoatKey, 'seats', action.oldPosition], oldAttendee)
				.setIn(['boats', action.newBoatKey, 'seats', action.newPosition], action.newAttendee);
		default:
			return state;
	}
}