import { createBoatSeats } from "./utils/boatSeatUtils";
import { attendeeIsPlaced } from "./utils/attendeeUtils";
import attendeePositions from "./constants/attendeePositions";

export default function(state) {
	return {
		unassignedAttendees: state
			.get("attendees")
			.filterNot(attendeeIsPlaced)
			.map(attendee => attendee.get("teamMember"))
			.sort((x, y) => {
				if (x.get("position") === y.get("position")) {
					return x.get("sortName").localeCompare(y.get("sortName"));
				}

				return x.get("position") === attendeePositions.COXSWAIN ? -1 : 1;
			}),
		boats: state
			.get("boats")
			.map((boat, boatKey) => {
				const attendees = state
					.get("attendees")
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