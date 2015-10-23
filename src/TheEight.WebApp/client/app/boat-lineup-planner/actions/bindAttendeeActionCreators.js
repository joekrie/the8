import actionTypes from './actionTypes';

export default function(dispatch) {
	return {
		onAssignAttendee: (attendeeId, boatKey, seatPosition) => 
			dispatch({
				type: actionTypes.ASSIGN_ATTENDEE,
				attendeeId,
				boatKey,
				seatPosition
			}),	
		onUnassignAttendee: attendeeId => 
			dispatch({
				type: actionTypes.UNASSIGN_ATTENDEE,
				attendeeId
			})
	}
}