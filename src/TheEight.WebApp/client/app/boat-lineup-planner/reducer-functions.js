export const assignAttendee = (prevState, action) => {
    const { attendeeId, boatId, seatNumber } = action.payload;
    const newBoats = prevState.boats.setIn([boatId, "assignedSeats", seatNumber], attendeeId);

    return {
        ...prevState,
        boats: newBoats
    };
};

export const unassignAttendee = (prevState, action) => {
    const { boatId, seatNumber } = action.payload;
    const newBoats = prevState.boats.deleteIn([boatId, "assignedSeats", seatNumber]);
    
    return {
        ...prevState,
        boats: newBoats
    };
};