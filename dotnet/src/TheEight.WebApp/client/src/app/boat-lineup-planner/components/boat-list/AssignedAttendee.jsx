import { Component } from "react"
import { DragSource } from "react-dnd"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { compose } from "recompose"
import { observer } from "mobx-react"

import Attendee from "../common/attendee.component"

import "./assigned-attendee.container.scss"

function AssignedAttendee(props) {
  const isOutOfPosition = !props.acceptedPositions.includes(props.attendee.position)

  return props.connectDragSource(
    <div className="assign-attendee">
      <Attendee attendee={props.attendee} isOutOfPosition={isOutOfPosition} />
    </div>
  )
}

const dragSource = DragSource(
  "ASSIGNED_ATTENDEE", {
    beginDrag(props) {
      return {
        originBoatId: props.boatId,
        originSeatNumber: props.seatNumber,
        draggedAttendeeId: props.attendee.attendeeId,
        attendeeIdsInOriginBoat: props.attendeeIdsInBoat,
        draggedAttendeeName: props.attendee.displayName
      }
    }
  }, connect => ({
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview()
  })
)

export default compose(
  dragSource,
  observer
)(AssignedAttendee)
