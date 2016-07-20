export default function unassignAttendee(prevState, action) {
  const { 
    type, 
    payload: { boatId, seatNumber } 
  } = action

  const newBoats = prevState.boats.deleteIn([boatId, "assignedSeats", seatNumber])
  
  return {
    ...prevState,
    boats: newBoats
  }
}
