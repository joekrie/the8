import actionTypes from '../actions/actionTypes';
import fakeInitialState from '../fakeInitialState';

const initialState = fakeInitialState;

export default function(state = initialState, action) {
	switch (action.type) {
		case actionTypes.ASSIGN:
			const newBoats = this.data.boats
				.setIn([boatKey, 'seats', position], attendee);
				
			const newUnassigned = this.data.unassignedAttendees
				.delete(attendee.get('id'));
			
			this.onDataChange('boats', newBoats);
			this.onDataChange('unassignedAttendees', newUnassigned);
		case actionTypes.UNASSIGN:

		case actionTypes.MOVE:

	}
}