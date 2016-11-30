import { Component } from "react"
import { compose } from "ramda"
import { observer } from "mobx-react"
import classNames from "classnames";
import CSSModules from "react-css-modules"

import Attendee from "../../shared/attendee"
import styles from "./styles.css"
import dragSource from "./dnd"

function AssignedAttendee({ seat, isDragging, connectDragSource, connectDragPreview }) {
  const rootStyle = isDragging ? 'is-dragging' : null;
  const isOutOfPosition = !attendeeInCorrectPosition(seat.number, seat.attendee.position);

  return (
    <div styleName={rootStyle}>
      <Attendee attendee={seat.attendee} isOutOfPosition={isOutOfPosition} connectDragSource={connectDragSource}
        connectDragPreview={connectDragPreview} />
    </div>
  )
}

export default compose(
  dragSource,
  observer,
  CSSModules(styles)
)(AssignedAttendee)

function attendeeInCorrectPosition(seatNumber, attendeePosition) {
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
