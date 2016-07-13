const saveEventDetailsRequest = (prevState, action) => {
  const { 
    type, 
    payload: { property, newValue } 
  } = action

  if (property === "eventId") {
    return { ...prevState }
  }
  
  const newDetails = prevState.eventDetails.set(property, newValue)
      
  return {
    ...prevState,
    eventDetails: newDetails
  }
}

export default saveEventDetailsRequest
