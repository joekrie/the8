import { DropTarget } from "react-dnd"
import R from "ramda"

export function canDrop(props, monitor) {
  const draggedItem = monitor.getItem()
  const alreadyInBoat = draggedItem.boat.isAttendeeInBoat(draggedItem.seat.attendee.attendeeId)
  
  if (monitor.getItemType() == "ATTENDEE_LIST_ITEM") {
    return !alreadyInBoat
  }
  
  if (monitor.getItemType() == "ASSIGNED_ATTENDEE") {
    const isMoveWithinBoat = props.seat.boatId == draggedItem.seat.boatId
    const isSameSeat = R.equals(props.seat, draggedItem.seat)
    return !isSameSeat && (isMoveWithinBoat || !alreadyInBoat)
  }
}
  
export function drop(props, monitor) {
  const draggedItem = monitor.getItem()
  props.boat.placeAttendee(draggedItem.seat.attendee.attendeeId, props.seat.number)

  if (monitor.getItemType() == "ASSIGNED_ATTENDEE") {
    const isTargetInOrigin = draggedItem.boat.isAttendeeInBoat(props.seat.attendee.attendeeId)
    const isMoveWithinBoat = props.seat.boatId == draggedItem.seat.boatId
    const isSwapWithinBoat = isMoveWithinBoat && props.seat.attendee
    const isSwapAcrossBoats = !isMoveWithinBoat && props.seat.attendee && !isTargetInOrigin

    if (isSwapWithinBoat || isSwapAcrossBoats) {
      draggedItem.boat.placeAttendee(props.attendee.attendeeId, draggedItem.seat.number)
    }

    const shouldUnassign = (!isSwapWithinBoat && isTargetInOrigin) 
      || (isMoveWithinBoat && !attendeeIdInTarget)
      || (!isMoveWithinBoat && !attendeeIdInTarget)

    if (shouldUnassign) {
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

const dropTarget = DropTarget(["ATTENDEE_LIST_ITEM", "ASSIGNED_ATTENDEE"], 
  { canDrop, drop }, dropCollect)

export default dropTarget
