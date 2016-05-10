const placeAttendees = (prevState, action) => {
    const { assignments, unassignments } = action.payload;
    let newBoats = prevState.boats;

    assignments.forEach(({ attendeeId, seat }) => {
        const boat = newBoats.get(seat.boatId);

        if (boat) {
            const newBoat = boat.assignAttendee(attendeeId, seat.seatNumber);
            newBoats = newBoats.set(seat.boatId, newBoat);
        }
    });

    unassignments.forEach(({ boatId, seatNumber }) => {
        const boat = newBoats.get(boatId);

        if (boat) {
            const newBoat = boat.unassignSeat(seatNumber);
            newBoats = newBoats.set(boatId, newBoat);
        }
    });
    
    return {
        ...prevState,
        boats: newBoats
    };
};

export { placeAttendees }