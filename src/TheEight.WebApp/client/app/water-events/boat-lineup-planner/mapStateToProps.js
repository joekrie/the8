import createBoatSeats from "./utils/createBoatSeats";
import { attendeeIsPlaced } from "./utils/attendeeUtils";

export default function(state) {
	return {
		unassignedAttendees: state
			.attendees
			.filterNot(attendeeIsPlaced)
			.map(attendee => attendee.get("teamMember"))
			.sort((x, y) => {
				if (x.get("position") === y.get("position")) {
					return x.get("sortName").localeCompare(y.get("sortName"));
				}

				return x.get("position") === "COXSWAIN" ? -1 : 1;
			}),
		boats: state
			.boats
			.map((boat, boatKey) => {
				const attendees = state
					.attendees
					.filter(attendee => attendee.getIn(["placement", "boatKey"]) === boatKey);
				
				const boatSeats = createBoatSeats(boat.get("type"))
					.map((seat, seatPosition) => {
						const seatAttendee = attendees.find(attendee => 
							attendee.getIn(["placement", "seat"]) === seatPosition
						);
						
						if (seatAttendee) {
							return seat.set("attendee", seatAttendee.get("teamMember"));
						}
						
						return seat.set("attendee", null);
					});
				
				return boat.set("seats", boatSeats);
			})
	}
}