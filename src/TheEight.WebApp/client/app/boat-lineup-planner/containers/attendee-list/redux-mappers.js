import { bindActionCreators } from "redux"

import AttendeeListItemRecord from "boat-lineup-planner/models/attendees/attendee-list-item-record"

export const mapStateToProps = state => {
  const { attendees, boats, event } = state

  const assignedAttendeeIds = 
    boats
      .boats
      .map(boat => boat.boat.assignedSeats.valueSeq())
      .valueSeq()
      .flatten()

  const attendeeListItems = 
    attendees
      .attendees
      .map(attendee => 
        new AttendeeListItemRecord({
          attendee,
          isAssigned: assignedAttendeeIds.contains(attendee.attendeeId)
        })
      )
    
  return { 
    attendeeListItems,
    eventDetails: event
  }
}
