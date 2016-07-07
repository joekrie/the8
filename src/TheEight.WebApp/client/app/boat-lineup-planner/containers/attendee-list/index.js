import { List } from "immutable"
import { Component } from "react"
import { DropTarget } from "react-dnd"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"

import AttendeeListItem from "boat-lineup-planner/components/attendee-list-item"
import EventDetails from "boat-lineup-planner/components/event-details"
import BoatCreator from "boat-lineup-planner/components/boat-creator"
import AttendeeCreator from "boat-lineup-planner/components/attendee-creator"

import { defaultDropCollect } from "common/dnd-defaults"
import { ASSIGNED_ATTENDEE } from "boat-lineup-planner/dnd-item-types"
import { RACE_MODE } from "boat-lineup-planner/models/event-modes"
import { unassignAttendee, changeEventDetails, createBoat, createAttendee } from "boat-lineup-planner/reducer/action-creators"
import AttendeeListItemRecord from "boat-lineup-planner/models/attendee-list-item-record"

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

export const mapDispatchToProps = dispatch => bindActionCreators({
  unassignAttendee, 
  changeEventDetails, 
  createBoat, 
  createAttendee
}, dispatch)

export const dropSpec = {
  drop(props, monitor) {
    const { unassignAttendee } = props
    const { originBoatId, originSeatNumber } = monitor.getItem()
    unassignAttendee(originBoatId, originSeatNumber)
  }
}

@connect(mapStateToProps, mapDispatchToProps)
@DropTarget(ASSIGNED_ATTENDEE, dropSpec, defaultDropCollect)
export default class AttendeeList extends Component {
  render() {
    const { attendeeListItems, connectDropTarget, eventDetails, changeEventDetails, createBoat, createAttendee } = this.props

    const attendeeComponents = attendeeListItems
      .filter(item => eventDetails.mode === RACE_MODE || !item.isAssigned)
      .map(item =>
        <AttendeeListItem key={item.attendee.attendeeId} attendeeListItem={item} 
          eventDetails={eventDetails} />
      )

    const styles = {
      root: {
        "float": "left",
        "width": "275px",
        "height": "100%"
      },
      attendeeList: {
        "paddingTop": "15px"
      }
    }

    return connectDropTarget(
      <div className="card" style={styles.root}>
        <h1 className="card-header">
          Boat Lineups
        </h1>
        <div className="card-block">
          <EventDetails eventDetails={eventDetails} changeEventDetails={changeEventDetails} />
          <BoatCreator createBoat={createBoat} />
          <AttendeeCreator createAttendee={createAttendee} />
          <div style={styles.attendeeList}>
            {attendeeComponents}
          </div>
        </div>
      </div>
    )
  }
}