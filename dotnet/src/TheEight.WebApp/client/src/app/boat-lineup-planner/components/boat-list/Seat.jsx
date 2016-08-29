import { Component } from "react"
import { DropTarget } from "react-dnd"
import { observer } from "mobx-react"
import { compose } from "recompose"
import R from "ramda"

import AssignedAttendee from "./AssignedAttendee"

import dropTarget from "./Seat.dnd"
import "./Seat.scss"

function Seat(props) {
  const isCoxSeat = props.seatNumber === 0
  const isPort = props.seatNumber % 2
  const label = isCoxSeat ? "C" : props.seatNumber

  const acceptedPositions =
    isCoxSeat ? ["COXSWAIN"]
              : isPort ? ["PORT_ROWER", "BISWEPTUAL_ROWER"]
                       : ["STARBOARD_ROWER", "BISWEPTUAL_ROWER"]

  const attendeeSlot = 
    props.attendeeId 
      ? <AssignedAttendee attendeeId={props.attendeeId} boatId={props.boatId}
          seatNumber={props.seatNumber} attendeeIdsInBoat={props.attendeeIdsInBoat}
          acceptedPositions={acceptedPositions} />
      : <div className="card placeholder"
          style={props.isOver ? { backgroundColor: "lightgrey" } : {}}></div>

  return props.connectDropTarget(
    <div className="seat">
      <div className="seat-num">
        {label}
      </div>
      {attendeeSlot}
    </div>
  )
}

export default compose(
  dropTarget,
  observer
)(Seat)
