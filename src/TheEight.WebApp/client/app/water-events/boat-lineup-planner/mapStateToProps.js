export const attendeeIsAssignable = (attendee, settings) => {
    const allowMultiple = settings.get("allowMultipleAssignments");

    if (allowMultiple) {
        return true;
    }

    const assigned = event
        .get("boats")
        .flatMap(boat => boat.get("seatAssignments").valueSeq());

    const attendeeId = attendee.get("attendeeId");
    return !assigned.includes(attendeeId);
};

export const sortAttendees = (x, y) => {
    if (x.get("position") === y.get("position")) {
        return x
            .get("sortName")
            .localeCompare(y.get("sortName"));
    }

    return x.get("position") === 0 ? -1 : 1;
};

export const getAssignableAttendees =
    attendees => attendees
        .filter(attendeeIsAssignable)
        .sort(sortAttendees);

export const mapBoat = (boat, attendees) => {
    const seats = boat
        .get("seatAssignments")
        .map(seat => {
            if (seat === null) {
                return null;
            }

            return attendees.find(attendee => seat === attendee.get("attendeeId"));
        });

    return boat.set("seatAssignments", seats);
};

export default state => {
    const { boats, attendees, settings } = state;

    return {
        eventSettings: settings,
        boats: boats.map(boat => mapBoat(boat, attendees)),
        attendees,
        assignableAttendees: getAssignableAttendees(attendees)
    };
};