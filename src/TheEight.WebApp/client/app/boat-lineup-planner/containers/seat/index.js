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

import { dropSpec, dropCollect } from "./dnd"

import "./styles.scss"

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