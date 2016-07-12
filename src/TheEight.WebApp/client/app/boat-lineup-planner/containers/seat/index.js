import { Component } from "react"
import { DropTarget } from "react-dnd"
import { connect } from "react-redux"

import AssignedAttendee from "boat-lineup-planner/containers/assigned-attendee"

import { 
  ASSIGNED_ATTENDEE, 
  ATTENDEE_LIST_ITEM 
} from "boat-lineup-planner/dnd-item-types"

import { 
  COXSWAIN, 
  PORT_ROWER, 
  STARBOARD_ROWER, 
  BISWEPTUAL_ROWER 
} from "boat-lineup-planner/models/attendee-positions"

import { RACE_MODE } from "boat-lineup-planner/models/event-modes"

import { mapStateToProps, mapDispatchToProps } from "./redux-specs"
import { dropSpec, dropCollect } from "./dnd-specs"

import "./styles.scss"

@connect(mapStateToProps, mapDispatchToProps)
@DropTarget([ATTENDEE_LIST_ITEM, ASSIGNED_ATTENDEE], dropSpec, dropCollect)
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