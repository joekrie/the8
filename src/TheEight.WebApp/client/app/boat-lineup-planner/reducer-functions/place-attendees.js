const placeAttendees = (prevState, { payload: { assignments, unassignments } }) => {
    const boats = prevState.boats.withMutations(mutable => {
        assignments.forEach(({ attendeeId, seat: { boatId, seatNumber } }) => {
            mutable.set([boatId, "assignedSeats", seatNumber], attendeeId);
        });

        unassignments.forEach(({ boatId, seatNumber }) => {
            mutable.delete([boatId, "assignedSeats", seatNumber]);
        });
    });

    return {
        ...prevState,
        boats
    };
};

export default placeAttendees;