export const placeAttendees = (prevState, action) => {
    const { assignments, unassignments } = action.payload;
    let newBoats = prevState.boats;

    assignments.forEach(({ attendeeId, boatId, seat }) => {
        const boat = newBoats.get(boatId);

        if (boat) {
            const newBoat = boat.assignAttendee(attendeeId, seat);
            newBoats = newBoats.set(boatId, newBoat);
        }
    });

    unassignments.forEach(({ boatId, seat }) => {
        const boat = newBoats.get(boatId);

        if (boat) {
            const newBoat = boat.unassignSeat(seat);
            newBoats = newBoats.set(boatId, newBoat);
        }
    });
    
    return {
        ...prevState,
        boats: newBoats
    };
};

export const replaceState = (prevState, action) => action.payload.state;