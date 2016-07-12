export default function saveEventDetails(prevState, { type, payload: { property, newValue } }) {     
  if (property === "eventId") {
    return { ...prevState }
  }
  
  const newDetails = prevState.eventDetails.set(property, newValue)
      
  return {
    ...prevState,
    eventDetails: newDetails
  }
}