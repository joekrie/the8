export default function assignAttendee(prevState, action) {
  const { 
    type, 
    payload: { attendeeId, boatId, seatNumber } 
  } = action

  return prevState.boats.setIn(["boats", boatId, "assignedSeats", seatNumber], attendeeId)
}
