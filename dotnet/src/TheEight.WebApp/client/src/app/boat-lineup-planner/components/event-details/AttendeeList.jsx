import { Component } from "react"
import { DropTarget } from "react-dnd"
import { observer, inject } from "mobx-react"
import R from "ramda"

import AttendeeListItem from "./AttendeeListItem"

import "./AttendeeList.scss"

function AttendeeList(props) {
  const attendeesToShow = R.filter(attn => !props.boatStore.isAttendeePlacedInAnyBoat(attn.attendeeId), 
    props.attendeeStore.attendees)

  return props.connectDropTarget(
    <div className="attendee-list card">
      <div className="card-block">
        <div className="list-items">
          {attendeesToShow.map(attn => 
            <AttendeeListItem key={attn.attendeeId} attendee={attn} />
          )}
        </div>
      </div>
    </div>
  )
}

function dropCollect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop(),
    itemType: monitor.getItemType()
  }
}

const dropSpec = {
  drop(props, monitor) {
    const draggedItem = monitor.getItem()
    draggedItem.boat.unplaceAttendee(draggedItem.seat.number)
  }
}

export default R.compose(
  DropTarget("ASSIGNED_ATTENDEE", dropSpec, dropCollect),
  inject("attendeeStore", "boatStore"),
  observer
)(AttendeeList)
