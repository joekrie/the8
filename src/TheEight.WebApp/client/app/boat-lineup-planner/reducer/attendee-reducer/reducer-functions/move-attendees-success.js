export const assignAttendee = (prevState, action) => {
  const { 
    type, 
    payload: { attendeeId, boatId, seatNumber } 
  } = action

  const newBoats = prevState.boats.setIn([boatId, "assignedSeats", seatNumber], attendeeId)

  return {
    ...prevState,
    boats: newBoats
  }
}
