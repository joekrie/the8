export default function addAttendee(prevState, action) {
  const { 
    type, 
    payload: { attendee } 
  } = action
  
  return prevState.update("attendees", attns => attns.push(attendee))
}
