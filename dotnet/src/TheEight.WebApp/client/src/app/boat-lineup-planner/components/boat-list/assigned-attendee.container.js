import { Component } from "react"
import { DragSource } from "react-dnd"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { compose, pure } from "recompose"

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

export const redux = {
  mapStateToProps(state, ownProps) {
    return {
      attendee: state.attendees.find(attn => attn.attendeeId === ownProps.attendeeId)
    }
  }
}

export const dnd = {
  dragSpec: {
    beginDrag(props) {
      return {
        originBoatId: props.boatId,
        originSeatNumber: props.seatNumber,
        draggedAttendeeId: props.attendee.attendeeId,
        attendeeIdsInOriginBoat: props.attendeeIdsInBoat,
        draggedAttendeeName: props.attendee.displayName
      }
    }
  },
  dragCollect(connect) {
    return {
      connectDragSource: connect.dragSource(),
      connectDragPreview: connect.dragPreview()
    }
  }
}

export default compose(
  connect(mapStateToProps),
  DragSource("ASSIGNED_ATTENDEE", dragSpec, dragCollect),
  pure
)(AssignedAttendee)
