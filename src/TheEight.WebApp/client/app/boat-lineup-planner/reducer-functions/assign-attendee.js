export default function (prevState, { type, payload: { attendeeId, boatId, seatNumber } }) {
  const newBoats = prevState.boats.setIn([boatId, "assignedSeats", seatNumber], attendeeId)

  return {
    ...prevState,
    boats: newBoats
  }
}