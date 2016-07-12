export default function addAttendee(prevState, { type, payload: { attendee } }) {
  const newAttendees = prevState.attendees.push(attendee)
  
  return {
    ...prevState,
    attendees: newAttendees
  }
}