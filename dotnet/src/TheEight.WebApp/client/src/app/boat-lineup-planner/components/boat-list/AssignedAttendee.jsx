import { Component } from "react"
import { DragSource } from "react-dnd"
import { compose } from "recompose"
import { observer, inject } from "mobx-react"

import Attendee from "../common/Attendee"

import "./AssignedAttendee.scss"

function AssignedAttendee(props) {
  const isCoxSeat = props.seat.number === 0
  const isPort = props.seat.number % 2
  const attendeePosition = props.seat.attendee.position
  let isOutOfPosition 
  
  if (isCoxSeat) {
    isOutOfPosition = attendeePosition == "COXSWAIN"
  } else {
    if (attendeePosition == "BISWEPTUAL_ROWER") {
      isOutOfPosition = !isCoxSeat
    } else {
      if (isPort) {
        isOutOfPosition = attendeePosition == "PORT_ROWER"
      } else {
        isOutOfPosition = attendeePosition == "STARBOARD_ROWER"
      }
    }
  }
  
  return props.connectDragSource(
    <div className="assign-attendee">
      <Attendee attendee={props.seat.attendee} isOutOfPosition={isOutOfPosition} />
    </div>
  )
}

const dragSource = DragSource(
  "ASSIGNED_ATTENDEE", 
  {
    beginDrag(props) {
      return {
        boat: props.boat,
        seat: props.seat
      }
    }
  }, connect => ({
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview()
  })
)

export default compose(
  dragSource,
  observer
)(AssignedAttendee)
