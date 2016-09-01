import { Component } from "react"
import { DragSource } from "react-dnd"
import { getEmptyImage } from "react-dnd-html5-backend"
import R from "ramda"

import Attendee from "../common/Attendee"

import "./AttendeeListItem.scss"

class AttendeeListItem extends Component {
  componentDidMount() {
    //this.props.connectDragPreview(getEmptyImage())
  }

  render() {
    return (
      this.props.connectDragSource(
        <div className="attendee-list-item">
          <Attendee attendee={this.props.attendee} />
        </div>
      )
    )
  }
}
  
function beginDrag(props) {
  return {
    attendee: props.attendee
  }
}

function dragCollect(connect) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview()
  }
}

export default DragSource("ATTENDEE_LIST_ITEM", { beginDrag }, dragCollect)(AttendeeListItem)
