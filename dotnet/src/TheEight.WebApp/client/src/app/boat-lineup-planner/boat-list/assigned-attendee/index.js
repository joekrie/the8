import { Component } from "react"
import { compose } from "ramda"
import { observer } from "mobx-react"
import classNames from "classnames";

import Attendee from "../../shared/attendee"
import styles from "./styles.scss"
import dragSource from "./dnd"

function AssignedAttendee(props) {
  const isCoxSeat = props.seat.number === 0
  const isPort = props.seat.number % 2
  const attendeePosition = props.seat.attendee.position
  
  let isOutOfPosition = false
  
  if (isCoxSeat) {
    isOutOfPosition = attendeePosition != "COXSWAIN"
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
  
  return (
    <div className={classNames({[styles.isDragging]: props.isDragging})}>
      <Attendee attendee={props.seat.attendee} isOutOfPosition={isOutOfPosition} 
        connectDragSource={props.connectDragSource} connectDragPreview={props.connectDragPreview} />
    </div>
  )
}

export default compose(
  dragSource,
  observer
)(AssignedAttendee)
