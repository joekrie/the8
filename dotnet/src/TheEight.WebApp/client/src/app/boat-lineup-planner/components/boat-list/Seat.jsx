import { Component } from "react"
import { DropTarget } from "react-dnd"
import { observer } from "mobx-react"
import { compose } from "recompose"
import R from "ramda"

import AssignedAttendee from "./AssignedAttendee"

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

export const dropSpec = {
  canDrop(props, monitor) {
    const { 
      attendeeIdsInBoat: attendeeIdsInTargetBoat, 
      boatId: targetBoatId, 
      seatNumber: targetSeatNumber 
    } = props
    
    const itemType = monitor.getItemType()

    const { 
      draggedAttendeeId, 
      originSeatNumber, 
      originBoatId 
    } = monitor.getItem()
    
    const alreadyInBoat = attendeeIdsInTargetBoat.contains(draggedAttendeeId)
    
    if (itemType === "ATTENDEE_LIST_ITEM") {
      return !alreadyInBoat
    }
    
    const isMoveWithinBoat = targetBoatId === originBoatId
    const isSameSeat = targetSeatNumber === originSeatNumber && isMoveWithinBoat
      
    return !isSameSeat && (isMoveWithinBoat || !alreadyInBoat)
  },
  drop(props, monitor) {
    const { 
      assignAttendee,
      unassignAttendee,
      seatNumber: targetSeatNumber, 
      boatId: targetBoatId, 
      attendeeId: attendeeIdInTarget 
    } = props
    
    const { 
      draggedAttendeeId, 
      originSeatNumber, 
      originBoatId, 
      attendeeIdsInOriginBoat 
    } = monitor.getItem()

    const draggedType = monitor.getItemType()

    if (draggedType === "ATTENDEE_LIST_ITEM") {
      assignAttendee(draggedAttendeeId, targetBoatId, targetSeatNumber)
    }

    if (draggedType === "ASSIGNED_ATTENDEE") {
      props.boatStore.assignAttendee(draggedAttendeeId, targetBoatId, targetSeatNumber)

      const isTargetInOrigin = attendeeIdsInOriginBoat.contains(attendeeIdInTarget)
      const isMoveWithinBoat = targetBoatId === originBoatId
      const isSwapWithinBoat = isMoveWithinBoat && attendeeIdInTarget

      const shouldAssignAttendeeInTarget = isSwapWithinBoat || (!isMoveWithinBoat 
        && attendeeIdInTarget && !isTargetInOrigin)

      if (shouldAssignAttendeeInTarget) {
        assignAttendee(attendeeIdInTarget, originBoatId, originSeatNumber)
      }

      const shouldUnassign = 
        (!isSwapWithinBoat && isTargetInOrigin) 
          || (isMoveWithinBoat && !attendeeIdInTarget)
          || (!isMoveWithinBoat && !attendeeIdInTarget)

      if (shouldUnassign) {
        unassignAttendee(originBoatId, originSeatNumber)
      }
    }
  }
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

export default compose(
  DropTarget(["ATTENDEE_LIST_ITEM", "ASSIGNED_ATTENDEE"], dropSpec, dropCollect),
  observer
)(Seat)
