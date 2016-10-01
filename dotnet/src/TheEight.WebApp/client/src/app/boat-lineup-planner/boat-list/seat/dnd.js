import { path } from "ramda"
import { DropTarget } from "react-dnd"

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
  const draggedAttendeeId = path(["attendee", "attendeeId"], draggedItem)
  const attendeeIdInTarget = path(["attendee", "attendeeId"], props.seat)

  props.boat.placeAttendee(draggedAttendeeId, props.seat.number)

  if (monitor.getItemType() == "ASSIGNED_ATTENDEE") {
    const isTargetInOrigin = draggedItem.boat.isAttendeeInBoat(draggedAttendeeId)
    const isMoveWithinBoat = props.boat.boatId == draggedItem.boat.boatId
    const isSwapWithinBoat = isMoveWithinBoat && attendeeIdInTarget
    const isSwapAcrossBoats = !isMoveWithinBoat && attendeeIdInTarget && isTargetInOrigin

    if (isSwapWithinBoat || isSwapAcrossBoats) {
      draggedItem.boat.placeAttendee(attendeeIdInTarget, draggedItem.seat.number)
    }

    if (isSwapAcrossBoats) {
      return;
    }

    if ((!isSwapWithinBoat && isTargetInOrigin) || !attendeeIdInTarget) {
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

const dropTarget = DropTarget(["ATTENDEE_LIST_ITEM", "ASSIGNED_ATTENDEE"], { canDrop, drop }, dropCollect)
export default dropTarget
