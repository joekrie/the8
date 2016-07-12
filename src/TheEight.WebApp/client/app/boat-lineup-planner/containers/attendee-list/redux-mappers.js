import { bindActionCreators } from "redux"

export const mapStateToProps = state => {
  const { attendees, boats, eventDetails } = state
  const assignedAttendeeIds = boats.map(boat => boat.assignedSeats.valueSeq()).valueSeq().flatten()
  
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

export const mapDispatchToProps = dispatch => 
  bindActionCreators({
    unassignAttendee, 
    moveAttendeesRequest,
    saveEventDetailsRequest, 
    addBoat, 
    addAttendee
  }, dispatch)

export const dropSpec = {
  drop(props, monitor) {
    const { unassignAttendee } = props
    const { originBoatId, originSeatNumber } = monitor.getItem()

    moveAttendeesRequest([
      unassignAttendee(originBoatId, originSeatNumber)
    ])
  }
}