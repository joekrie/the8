import { Component } from "react"
import { DragSource } from "react-dnd"
import { getEmptyImage } from "react-dnd-html5-backend"
import classNames from "classnames"

import Attendee from "../attendee"

class AttendeeListItem extends Component {
  componentDidMount() {
    //this.props.connectDragPreview(getEmptyImage())
  }

  render() {
    return (
      this.props.connectDragSource(
        <div className={styles.root}>
          <Attendee attendee={this.props.attendee} />
        </div>
      )
    )
  }
}


export default DragSource("ATTENDEE_LIST_ITEM", { beginDrag }, dragCollect)(AttendeeListItem)
