const unassignAttendeeInSeat = (prevState, { payload: { seatInfo: { boatId, seatNumber } } }) => {
    const oldBoats = prevState.boats;
    const newBoats = oldBoats.delete([boatId, "assignedSeats", seatNumber]);

    return {
        ...prevState,
        boats: newBoats
    };
};

export default unassignAttendeeInSeat