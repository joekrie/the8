import { Component } from "react"
import { compose } from "ramda"
import { observer } from "mobx-react"
import classNames from "classnames";

import Attendee from "../../shared/attendee"
import styles from "./styles.scss"
import dragSource from "./dnd"

const attendeeInCorrectPosition = (seatNumber, attendeePosition) => {
  const isCoxSeat = seatNumber === 0

  if (isCoxSeat || attendeePosition == "COXSWAIN") {
    return isCoxSeat && attendeePosition == "COXSWAIN"
  }

  if (attendeePosition == "BISWEPTUAL_ROWER") {
    return true
  }

  if (seatNumber % 2) {
    return attendeePosition == "STARBOARD_ROWER"
  }

  return attendeePosition == "PORT_ROWER"
}

function AssignedAttendee(props) {
  return (
    <div className={classNames({[styles.isDragging]: props.isDragging})}>
      <Attendee attendee={props.seat.attendee} isOutOfPosition={!attendeeInCorrectPosition(props.seat.number, props.seat.attendee.position)} 
        connectDragSource={props.connectDragSource} connectDragPreview={props.connectDragPreview} />
    </div>
  )
}

export default compose(
  dragSource,
  observer
)(AssignedAttendee)
