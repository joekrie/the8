import { Component } from "react"
import { DropTarget } from "react-dnd"
import { connect } from "react-redux"

import AssignedAttendee from "./assigned-attendee.container"

import "./seat.container.scss"

function Seat(props) {
  const isCoxSeat = props.seatNumber === 0
  const isPort = props.seatNumber % 2
  
  const label = isCoxSeat ? "C" : props.seatNumber
  
  const getAcceptedPositions = () => {
    if (isCoxSeat) {
      return ["COXSWAIN"]
    }
    
    if (isPort) {
      return ["PORT_ROWER", "BISWEPTUAL_ROWER"]
    }
    
    return ["STARBOARD_ROWER", "BISWEPTUAL_ROWER"]
  }

  const getPlaceholderStyles = () =>
    props.isOver ? { backgroundColor: "lightgrey" } : {}
  
  const attendeeSlot = attendeeId 
    ? <AssignedAttendee attendeeId={props.attendeeId} boatId={props.boatId} 
        seatNumber={props.seatNumber} attendeeIdsInBoat={props.attendeeIdsInBoat}
        acceptedPositions={getAcceptedPositions()} />
    : <div className="card placeholder" style={getPlaceholderStyles()}></div>

  return props.connectDropTarget(
    <div className="seat">
      <div className="seat-num">
        {label}
      </div>
      {attendeeSlot}
    </div>
  )
}

export const dnd = {
  dropSpec: {
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
      
      const { 
        draggedAttendeeId, 
        originSeatNumber, 
        originBoatId, 
        attendeeIdsInOriginBoat 
      } = monitor.getItem()

      const itemType = monitor.getItemType()

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
  },
  dropCollect(connect, monitor) {
    return {
      connectDropTarget: connect.dropTarget(),
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
      itemType: monitor.getItemType()
    }
  }
}

export const redux = {
  mapStateToProps(state) {
    return {
      canAttendeeOccupyMultipleBoats: state.eventDetails.mode === RACE_MODE 
    }
  }
}

export default compose(
  connect(redux.mapStateToProps),
  DropTarget(["ATTENDEE_LIST_ITEM", "ASSIGNED_ATTENDEE"], dnd.dropSpec, dnd.dropCollect)
)(Seat)
