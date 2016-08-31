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

  const draggedAttendeeId = R.path(["attendee", "attendeeId"], draggedItem.seat)
  const attendeeIdInTarget = R.path(["attendee", "attendeeId"], props.seat)

  console.log(`Placing ${draggedAttendeeId} in boat ${props.boat.boatId} seat ${props.seat.number}`)
  props.boat.placeAttendee(draggedAttendeeId, props.seat.number)

  if (monitor.getItemType() == "ASSIGNED_ATTENDEE") {
    const isTargetInOrigin = draggedItem.boat.isAttendeeInBoat(draggedAttendeeId)
    const isMoveWithinBoat = props.seat.boatId == draggedItem.seat.boatId
    const isSwapWithinBoat = isMoveWithinBoat && props.seat.attendee
    const isSwapAcrossBoats = !isMoveWithinBoat && props.seat.attendee && !isTargetInOrigin

    if (isSwapWithinBoat || isSwapAcrossBoats) {
      console.log(`Placing ${attendeeIdInTarget} in boat ${draggedItem.boat.boatId} seat ${draggedItem.seat.number}`)
      draggedItem.boat.placeAttendee(attendeeIdInTarget, draggedItem.seat.number)
    }

    if ((!isSwapWithinBoat && isTargetInOrigin) || !props.seat.attendee) {
      console.log(`Unplacing attendee in boat ${draggedItem.boat.boatId} seat ${draggedItem.seat.number}`)
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
