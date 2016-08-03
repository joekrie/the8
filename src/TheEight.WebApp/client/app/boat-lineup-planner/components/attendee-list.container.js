import { List } from "immutable"
import { Component } from "react"
import { DropTarget } from "react-dnd"
import { connect } from "react-redux"

import AttendeeListItem from "boat-lineup-planner/components/attendee-list-item"
import EventDetails from "boat-lineup-planner/containers/event-details"
import BoatCreator from "boat-lineup-planner/components/boat-creator"
import AttendeeCreator from "boat-lineup-planner/components/attendee-creator"

import * as EventModes from "boat-lineup-planner/models/event/event-modes"
import AttendeeListItemRecord from "boat-lineup-planner/models/attendees/attendee-list-item-record"
 
import { mapStateToProps } from "./redux-mappers"
import { dropSpec } from "./dnd"

import "./attendee-list.container.scss"

export const defaultDropCollect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  isOverCurrent: monitor.isOver({ shallow: true }),
  canDrop: monitor.canDrop(),
  itemType: monitor.getItemType()
})

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

export const dropSpec = {
  drop(props, monitor) {
    const { unassignAttendee } = props
    const { originBoatId, originSeatNumber } = monitor.getItem()

    moveAttendeesRequest([
      unassignAttendee(originBoatId, originSeatNumber)
    ])
  }
}

@connect(mapStateToProps)
@DropTarget("ASSIGNED_ATTENDEE", dropSpec, defaultDropCollect)
export default class AttendeeList extends Component {
  render() {
    const {
      attendeeListItems,
      connectDropTarget, 
      eventDetails,
      changeEventDetails, 
      createBoat,
      createAttendee 
    } = this.props

    const attendeeComponents = attendeeListItems
      .filter(item => eventDetails.mode === EventModes.RACE_MODE || !item.isAssigned)
      .map(item =>
        <AttendeeListItem key={item.attendee.attendeeId} attendeeListItem={item} 
          eventDetails={eventDetails} />
      )

    return connectDropTarget(
      <div className="card attendee-list">
        <h1 className="card-header">
          Boat Lineups
        </h1>
        <div className="card-block">
          <EventDetails eventDetails={eventDetails} changeEventDetails={changeEventDetails} />
          <BoatCreator createBoat={createBoat} />
          <AttendeeCreator createAttendee={createAttendee} />
          <div className="list-items">
            {attendeeComponents}
          </div>
        </div>
      </div>
    )
  }
}
