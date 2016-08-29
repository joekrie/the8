import { DropTarget } from "react-dnd"
import { observer } from "mobx-react"
import { compose } from "recompose"
import R from "ramda"

export function canDrop(props, monitor) {
  const {
    boatId: targetBoatId, 
    seatNumber: targetSeatNumber 
  } = props
  
  const itemType = monitor.getItemType()

  const { 
    draggedAttendeeId, 
    originSeatNumber, 
    originBoatId 
  } = monitor.getItem()
  
  const alreadyInBoat = props.attendeeIdsInBoat.includes(draggedAttendeeId)
  
  if (itemType === "ATTENDEE_LIST_ITEM") {
    return !alreadyInBoat
  }
  
  const isMoveWithinBoat = targetBoatId === originBoatId
  const isSameSeat = R.equals(targetSeatNumber, originSeatNumber) && isMoveWithinBoat
    
  return !isSameSeat && (isMoveWithinBoat || !alreadyInBoat)
}
  
export function drop(props, monitor) {
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

    const isTargetInOrigin = attendeeIdsInOriginBoat.includes(attendeeIdInTarget)
    const isMoveWithinBoat = R.equals(targetBoatId, originBoatId)
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

export function dropCollect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop(),
    itemType: monitor.getItemType()
  }
}

const dropTarget = DropTarget(["ATTENDEE_LIST_ITEM", "ASSIGNED_ATTENDEE"], { canDrop, drop }, dropCollect)
export default dropTarget
