const addAttendee = (prevState, action) => {
  const { 
    type, 
    payload: { attendee } 
  } = action
  
  const newAttendees = prevState.attendees.push(attendee)
  
  return {
    ...prevState,
    attendees: newAttendees
  }
}

export default addAttendee
