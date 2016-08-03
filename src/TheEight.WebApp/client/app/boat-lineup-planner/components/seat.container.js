import { Component } from "react"
import { DropTarget } from "react-dnd"
import { connect } from "react-redux"

import AssignedAttendee from "boat-lineup-planner/containers/assigned-attendee"

import { 
  COXSWAIN, 
  PORT_ROWER, 
  STARBOARD_ROWER, 
  BISWEPTUAL_ROWER 
} from "boat-lineup-planner/models/attendees/attendee-positions"

import { RACE_MODE } from "boat-lineup-planner/models/event/event-modes"

import "./seat.container.scss"

import { 
  COXSWAIN, 
  PORT_ROWER, 
  STARBOARD_ROWER, 
  BISWEPTUAL_ROWER 
} from "boat-lineup-planner/models/attendees/attendee-positions"

import { RACE_MODE } from "boat-lineup-planner/models/event/event-modes"

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
    const { assignAttendee, unassignAttendee } = props 
    
    const { 
      seatNumber: targetSeatNumber, 
      boatId: targetBoatId, 
      attendeeId: attendeeIdInTarget 
    } = props
    
    const itemType = monitor.getItemType()

    const { 
      draggedAttendeeId, 
      originSeatNumber, 
      originBoatId, 
      attendeeIdsInOriginBoat 
    } = monitor.getItem()
        
    if (itemType === "ATTENDEE_LIST_ITEM") {
      assignAttendee(draggedAttendeeId, targetBoatId, targetSeatNumber)
    }
    
    if (itemType === "ASSIGNED_ATTENDEE") {
      const isTargetInOrigin = attendeeIdsInOriginBoat.contains(attendeeIdInTarget)
      const isMoveWithinBoat = targetBoatId === originBoatId
      const isSwapWithinBoat = isMoveWithinBoat && attendeeIdInTarget
            
      assignAttendee({
        draggedAttendeeId, 
        targetBoatId, 
        targetSeatNumber
      })
            
      if (isSwapWithinBoat || (!isMoveWithinBoat && attendeeIdInTarget && !isTargetInOrigin)) {
        assignAttendee({
          attendeeIdInTarget, 
          originBoatId, 
          originSeatNumber
        })
      }
            
      if ((!isSwapWithinBoat && isTargetInOrigin) || (isMoveWithinBoat && !attendeeIdInTarget)
          || (!isMoveWithinBoat && !attendeeIdInTarget)) {
        unassignAttendee({
          originBoatId, 
          originSeatNumber
        })
      }
    }
  }
}

export const dropCollect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  isOverCurrent: monitor.isOver({ shallow: true }),
  canDrop: monitor.canDrop(),
  itemType: monitor.getItemType()
})

export const mapStateToProps = state => ({
  canAttendeeOccupyMultipleBoats: state.eventDetails.mode === RACE_MODE 
})

@connect(mapStateToProps)
@DropTarget(["ATTENDEE_LIST_ITEM", "ASSIGNED_ATTENDEE"], dropSpec, dropCollect)
export default class Seat extends Component {
  render() {
    const { 
      connectDropTarget, 
      attendeeId, 
      boatId, 
      seatNumber, 
      attendeeIdsInBoat,
      isOver
    } = this.props

    const isCoxSeat = seatNumber === 0
    const isPort = seatNumber % 2
    
    const label = isCoxSeat ? "C" : seatNumber
    
    const getAcceptedPositions = () => {
      if (isCoxSeat) {
        return [COXSWAIN]
      }
      
      if (isPort) {
        return [PORT_ROWER, BISWEPTUAL_ROWER]
      }
      
      return [STARBOARD_ROWER, BISWEPTUAL_ROWER]
    }

    const getPlaceholderStyles = () =>
      isOver ? { backgroundColor: "lightgrey" } : {}
    
    const attendeeSlot = attendeeId 
      ? <AssignedAttendee attendeeId={attendeeId} boatId={boatId} 
          seatNumber={seatNumber} attendeeIdsInBoat={attendeeIdsInBoat}
          acceptedPositions={getAcceptedPositions()} />
      : <div className="card placeholder" style={getPlaceholderStyles()}></div>

    return connectDropTarget(
      <div className="seat">
        <div className="seat-num">
          {label}
        </div>
        {attendeeSlot}
      </div>
    )
  }
}