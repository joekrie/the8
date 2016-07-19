import { bindActionCreators } from "redux"

export const mapStateToProps = state => {
  const { attendees, boats, eventDetails } = state
  
  const assignedAttendeeIds = boats
    .map(boat => boat.assignedSeats.valueSeq())
    .valueSeq()
    .flatten()

  const attendeeListItems = attendees.map(attendee => 
    new AttendeeListItemRecord({
      attendee,
      isAssigned: assignedAttendeeIds.contains(attendee.attendeeId)
    })
  )
    
  return { 
    attendeeListItems,
    eventDetails
  }
}
