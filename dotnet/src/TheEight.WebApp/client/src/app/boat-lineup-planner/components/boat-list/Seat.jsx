import { Component, PropTypes } from "react"
import { DropTarget } from "react-dnd"
import { observer } from "mobx-react"
import { compose, branch } from "recompose"
import R from "ramda"
import { throttle } from "lodash"

import AssignedAttendee from "./AssignedAttendee"
import AttendeeModel from "../../models/Attendee"
import BoatModel from "../../models/Boat"

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
const log = throttle(txt => console.log(txt), 250)
export function canDrop(props, monitor) {
  const draggedItem = monitor.getItem()
  const alreadyInBoat = props.boat.isAttendeeInBoat(draggedItem.attendee.attendeeId)
  
  if (monitor.getItemType() == "ATTENDEE_LIST_ITEM") {
    return !alreadyInBoat
  }
  
  if (monitor.getItemType() == "ASSIGNED_ATTENDEE") {
    const getBoatId = R.path(["boat", "boatId"])
    const getSeatNumber = R.path(["seat", "number"])
    const isMoveWithinBoat = getBoatId(props) == getBoatId(draggedItem)
    const isSameSeat = isMoveWithinBoat && getSeatNumber(props) == getSeatNumber(draggedItem)
    
    return !isSameSeat && (isMoveWithinBoat || !alreadyInBoat)
  }
}

export function drop(props, monitor) {
  const draggedItem = monitor.getItem()
  const draggedAttendeeId = R.path(["attendee", "attendeeId"], draggedItem)
  const attendeeIdInTarget = R.path(["attendee", "attendeeId"], props.seat)

  props.boat.placeAttendee(draggedAttendeeId, props.seat.number)

  if (monitor.getItemType() == "ASSIGNED_ATTENDEE") {
    const isTargetInOrigin = draggedItem.boat.isAttendeeInBoat(draggedAttendeeId)
    const isMoveWithinBoat = props.boat.boatId == draggedItem.boat.boatId
    const isSwapWithinBoat = isMoveWithinBoat && props.seat.attendee
    const isSwapAcrossBoats = !isMoveWithinBoat && props.seat.attendee && !isTargetInOrigin

    if (isSwapWithinBoat || isSwapAcrossBoats) {
      draggedItem.boat.placeAttendee(attendeeIdInTarget, draggedItem.seat.number)
    }

    if ((!isSwapWithinBoat && isTargetInOrigin) || !props.seat.attendee) {
      draggedItem.boat.unplaceAttendee(draggedItem.seat.number)
    }
  }
}

export function dropCollect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
    itemType: monitor.getItemType()
  }
}

export default R.compose(
  DropTarget(["ATTENDEE_LIST_ITEM", "ASSIGNED_ATTENDEE"], { canDrop, drop }, dropCollect),
  observer
)(Seat)
