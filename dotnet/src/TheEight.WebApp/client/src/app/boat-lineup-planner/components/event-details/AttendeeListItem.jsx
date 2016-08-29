import { Component } from "react"
import { DragSource } from "react-dnd"
import { getEmptyImage } from "react-dnd-html5-backend"

import Attendee from "../common/attendee.component"

import "./attendee-list-item.component.scss"

export const dnd = {
  dragSpec: {
    canDrag(props) {
      return !props.attendeeListItem.isAssigned
    },
    beginDrag(props) {
      return {
        draggedAttendeeId: props.attendeeListItem.attendee.attendeeId,
        draggedAttendeeName: props.attendeeListItem.attendee.displayName
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

@DragSource("ATTENDEE_LIST_ITEM", dnd.dragSpec, dnd.dragCollect)
export default class AttendeeListItem extends Component {
  componentDidMount() {
    this.props.connectDragPreview(getEmptyImage())
  }

  render() {
    return (
      this.props.connectDragSource(
        <div className="attendee-list-item">
          <Attendee attendee={this.props.attendeeListItem.attendee} />
        </div>
      )
    )
  }
}
