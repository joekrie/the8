export const dragSpec = {
  beginDrag(props) { 
    const { 
      boatId, 
      seatNumber, 
      attendee, 
      attendeeIdsInBoat 
    } = props
    
    return {
      originBoatId: boatId,
      originSeatNumber: seatNumber,
      draggedAttendeeId: attendee.attendeeId,
      attendeeIdsInOriginBoat: attendeeIdsInBoat,
      draggedAttendeeName: attendee.displayName
    }
  }
}
