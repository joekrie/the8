export default function unassignAttendee(prevState, { type, payload: { boatId, seatNumber } }) {
  const newBoats = prevState.boats.deleteIn([boatId, "assignedSeats", seatNumber])
  
  return {
    ...prevState,
    boats: newBoats
  }
}