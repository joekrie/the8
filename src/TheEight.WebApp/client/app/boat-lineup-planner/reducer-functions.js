const placeAttendees = (prevState, { payload: { assignments, unassignments } }) => {
    let newBoats = prevState.boats;

    assignments.forEach(({ attendeeId, seat }) => {
        const boat = newBoats.get(seat.boatId);
        const newBoat = boat.assignAttendee(attendeeId, seat.seatNumber);
        newBoats = newBoats.set(seat.boatId, newBoat);
    });

    unassignments.forEach(({ boatId, seatNumber }) => {
        const boat = newBoats.get(boatId);
        const newBoat = boat.unassignSeat(seatNumber);
        newBoats = newBoats.set(boatId, newBoat);
    });

    return {
        ...prevState,
        boats: newBoats
    };
};

export { placeAttendees }