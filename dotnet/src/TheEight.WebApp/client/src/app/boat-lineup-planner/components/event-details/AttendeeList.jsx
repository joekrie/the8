import { List } from "immutable"
import { Component } from "react"
import { DropTarget } from "react-dnd"
import { connect } from "react-redux"
import { compose, pure } from "recompose"

import AttendeeListItem from "./attendee-list-item.component"
import EventDetails from "./event-details.container"
import BoatCreator from "./boat-creator.component"
import AttendeeCreator from "./attendee-creator.component"

import "./attendee-list.container.scss"

const AttendeeList = props => {
  const attendeeComponents = props.attendeeListItems
    .filter(item => props.eventDetails.mode === EventModes.RACE_MODE || !item.isAssigned)
    .map(item =>
      <AttendeeListItem key={item.attendee.attendeeId} attendeeListItem={item} 
        eventDetails={props.eventDetails} />
    )

  return props.connectDropTarget(
    <div className="attendee-list card">
      <h1 className="card-header">
        Boat Lineups
      </h1>
      <div className="card-block">
        <EventDetails eventDetails={props.eventDetails} changeEventDetails={props.changeEventDetails} />
        <BoatCreator createBoat={props.createBoat} />
        <AttendeeCreator createAttendee={props.createAttendee} />
        <div className="list-items">
          {attendeeComponents}
        </div>
      </div>
    </div>
  )
}

export const dnd = {
  dropCollect(connect, monitor) {
    return {
      connectDropTarget: connect.dropTarget(),
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
      itemType: monitor.getItemType()
    }
  }
}

export const redux = {
  mapStateToProps(state) {
    const assignedAttendeeIds = 
      state.boats
        .map(boat => boat.assignedSeats.valueSeq())
        .valueSeq()
        .flatten()

    const attendeeListItems = 
      state.attendees
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
  },
  dropSpec: {
    drop(props, monitor) {
      const { unassignAttendee } = props
      const { originBoatId, originSeatNumber } = monitor.getItem()

      moveAttendeesRequest([
        unassignAttendee(originBoatId, originSeatNumber)
      ])
    }
  }
}

const enhance = compose(
  connect(redux.mapStateToProps),
  DropTarget("ASSIGNED_ATTENDEE", dnd.dropSpec, dnd.dropCollect),
  pure
)

export default enhance(AttendeeList)
