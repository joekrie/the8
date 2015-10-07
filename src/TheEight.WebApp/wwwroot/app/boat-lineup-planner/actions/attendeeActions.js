import actionTypes from './actionTypes';

export default {
	assign: (attendee, newBoatKey, newPosition) => ({
		type: actionTypes.ASSIGN,
		attendee,
		newBoatKey,
		newPosition
	}),
	unassign: (attendee, oldBoatKey, oldPosition) => ({
		type: actionTypes.UNASSIGN,
		attendee, 
		oldBoatKey, 
		oldPosition
	}),
	move: (attendee, oldBoatKey, oldPosition, newBoatKey, newPosition) => ({
		type: actionTypes.MOVE,
		attendee, 
		oldBoatKey, 
		oldPosition, 
		newBoatKey, 
		newPosition
	})
}