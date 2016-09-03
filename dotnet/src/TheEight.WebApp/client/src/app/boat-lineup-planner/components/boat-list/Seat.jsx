import { Component, PropTypes } from "react"
import { DropTarget } from "react-dnd"
import { observer, inject } from "mobx-react"
import R, { compose, path } from "ramda"

import AssignedAttendee from "./AssignedAttendee"
import AttendeeModel from "../../models/Attendee"
import BoatModel from "../../models/Boat"

import "./Seat.scss"

function Seat(props) {
  const emptySeat = (
    <div className="card placeholder" 
      style={props.isOver ? { backgroundColor: "lightgrey" } : {}}></div>
  )

  let attendeeSlot 
  
  if (props.seat.attendee && !props.seat.attendee.isDragging) {
    attendeeSlot = <AssignedAttendee seat={props.seat} boat={props.boat} />
  } else {
    attendeeSlot = emptySeat
  }

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

export function canDrop(props, monitor) {
  const draggedItem = monitor.getItem()
  const alreadyInBoat = props.boat.isAttendeeInBoat(draggedItem.attendee.attendeeId)
  
  if (monitor.getItemType() == "ATTENDEE_LIST_ITEM") {
    return !alreadyInBoat
  }
  
  if (monitor.getItemType() == "ASSIGNED_ATTENDEE") {
    const getBoatId = path(["boat", "boatId"])
    const isMoveWithinBoat = getBoatId(props) == getBoatId(draggedItem)
    const getSeatNumber = path(["seat", "number"])
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

export default compose(
  DropTarget(["ATTENDEE_LIST_ITEM", "ASSIGNED_ATTENDEE"], { canDrop, drop }, dropCollect),
  observer
)(Seat)
