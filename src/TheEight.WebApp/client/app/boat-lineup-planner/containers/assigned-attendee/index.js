import { Component } from "react"
import { DragSource } from "react-dnd"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"

import { defaultDragCollect } from "common/dnd-defaults"
import { ASSIGNED_ATTENDEE } from "boat-lineup-planner/dnd-item-types"
import Attendee from "boat-lineup-planner/components/attendee"

import { dragSpec } from "./dnd-specs"
import { mapStateToProps } from "./redux-specs"

import "./styles.scss"

@connect(mapStateToProps)
@DragSource(ASSIGNED_ATTENDEE, dragSpec, defaultDragCollect)
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
