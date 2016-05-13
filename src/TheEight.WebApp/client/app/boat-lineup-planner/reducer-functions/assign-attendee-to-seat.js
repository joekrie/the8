const assignAttendeeToSeat = (prevState, { payload: { seatInfo: { boatId, seatNumber } } }) => {
    const oldBoats = prevState.boats;
    const newBoats = oldBoats.set([boatId, "assignedSeats", seatNumber], attendeeId);

    return {
        ...prevState,
        boats: newBoats
    };
};

export default assignAttendeeToSeat