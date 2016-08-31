import { Component } from "react"
import { DropTarget } from "react-dnd"
import { observer } from "mobx-react"
import { compose } from "recompose"
import R from "ramda"

import AssignedAttendee from "./AssignedAttendee"

import dropTarget from "./Seat.dnd"
import "./Seat.scss"

function Seat(props) {
  const attendeeSlot = props.seat.attendee
    ? <AssignedAttendee seat={props.seat} boat={props.boat} />
    : <div className="card placeholder" style={props.isOver ? { backgroundColor: "lightgrey" } : {}}></div>

  return props.connectDropTarget(
    <div className="seat">
      <div className="seat-num">
        {props.seat.label}
      </div>
      {attendeeSlot}
    </div>
  )
}

export default compose(
  dropTarget,
  observer
)(Seat)
