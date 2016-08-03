import { Component } from "react"
import { DragSource } from "react-dnd"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"

import Attendee from "./attendee.component"

import "./assigned-attendee.container.scss"

export const mapStateToProps = ({ attendees }, { attendeeId }) => {
  const attendee = attendees.find(attn => attn.attendeeId === attendeeId)
  return { attendee }
}

export const dragSpec = {
  beginDrag(props) { 
    const { 
      boatId, 
      seatNumber, 
      attendee, 
      attendeeIdsInBoat 
    } = props
    
    return {
      originBoatId: boatId,
      originSeatNumber: seatNumber,
      draggedAttendeeId: attendee.attendeeId,
      attendeeIdsInOriginBoat: attendeeIdsInBoat,
      draggedAttendeeName: attendee.displayName
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

@connect(mapStateToProps)
@DragSource("ASSIGNED_ATTENDEE", dragSpec, dragCollect)
export default class AssignedAttendee extends Component {
  render() {
    const { 
      attendee, 
      connectDragSource, 
      acceptedPositions 
    } = this.props
    
    const isOutOfPosition = !acceptedPositions.includes(attendee.position)

    return connectDragSource(
      <div className="assign-attendee">
        <Attendee attendee={attendee} isOutOfPosition={isOutOfPosition} />
      </div>
    )
  }
}
