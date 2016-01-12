const sortAttendees = (x, y) => {
    if (x.get("position") === y.get("position")) {
        return x
            .get("sortName")
            .localeCompare(y.get("sortName"));
    }

    return x.get("position") === 0 ? -1 : 1;
};

export default state => {
    const { event } = state;

    const attendeeIsAssignable = attendee => {
        const allowMultiple = event.getIn(["settings", "allowMultipleAssignments"]);
        
        if (allowMultiple) {
            return true;
        }

        const assigned = event
            .get("boats")
            .flatMap(boat => boat.get("seatAssignments"));

        const attendeeId = attendee.get("attendeeId");
        return assigned.includes(attendeeId);
    };

    const mapBoat = boat => {
        const allAttendees = event.get("attendees");

        const seats = boat
            .get("seatAssignments")
            .map(seat => {
                if (seat === null) {
                    return null;
                }

                return allAttendees
                    .find(attendee => seat === attendee.get("attendeeId"));
            });

        return boat.set("seatAssignments", seats);
    }

    return {
        eventSettings: event.get("settings"),
        boats: event
            .get("boats")
            .map(mapBoat),
        attendees: event.get("attendees"),
        assignableAttendees: event
            .get("attendees")
			.filterNot(attendeeIsAssignable)
			.sort(sortAttendees)
	}
};