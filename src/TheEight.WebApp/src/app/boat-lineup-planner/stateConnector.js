import createBoatSeats from './createBoatSeats';
import emptyAttendeePlacement from './constants/emptyAttendeePlacement';

export default function(state) {
	return {
		unassignedAttendees: state
			.get('attendees')
			.filter(attendee => attendee.get('placement').equals(emptyAttendeePlacement))
			.map(attendee => attendee.get('teamMember')),
		boats: state
			.get('boats')
			.map((boat, boatKey) => {
				const attendees = state
					.get('attendees')
					.filter(attendee => attendee.getIn(['placement', 'boatKey']) === boatKey);
				
				const boatSeats = createBoatSeats(boat.get('type'))
					.map((seat, seatPosition) => {
						const seatAttendee = attendees.find(attendee => 
							attendee.getIn(['placement', 'seat']) === seatPosition
						);
						
						if (seatAttendee) {
							return seatAttendee
								.get('teamMember');
						}
						
						return null;
					});
				
				return boat.set('seats', boatSeats);
			})
	}
}