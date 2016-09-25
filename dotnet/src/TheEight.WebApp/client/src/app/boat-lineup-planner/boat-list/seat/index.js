import { Component, PropTypes } from "react"
import { DropTarget } from "react-dnd"
import { observer } from "mobx-react"
import { compose, path } from "ramda"
import classNames from "classnames"

import AssignedAttendee from "../assigned-attendee"
import AttendeeModel from "../../attendee-list/attendee-model"
import BoatModel from "../boat-model"
import dropTarget from "./dnd" 
import styles from "./styles.scss"

function Seat(props) {
  let attendeeSlot

  if (props.seat.attendee && !props.seat.attendee.isDragging) {
    attendeeSlot = <AssignedAttendee seat={props.seat} boat={props.boat} />
  } else {
    attendeeSlot = null
  }

  return props.connectDropTarget(
    <div className={styles.root}>
      <div className={styles.seatNumber}>
        {props.seat.label}
      </div>
      <div className={classNames(styles.attendeeSlot, {[styles.hover]: props.isOver})}>
        {attendeeSlot}
      </div>
    </div>
  )
}

Seat.propTypes = {
  seat: PropTypes.shape({
    number: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    attendee: PropTypes.instanceOf(AttendeeModel)
  }),
  boat: PropTypes.instanceOf(BoatModel).isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  isOver: PropTypes.bool.isRequired
}

export default compose(
  dropTarget,
  observer
)(Seat)
