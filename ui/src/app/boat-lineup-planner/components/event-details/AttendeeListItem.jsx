import { Component } from "react"
import { DragSource } from "react-dnd"
import { getEmptyImage } from "react-dnd-html5-backend"
import R from "ramda"
import { StyleSheet, css } from "aphrodite"
import classNames from "classnames"

import Attendee from "../common/Attendee"

class AttendeeListItem extends Component {
  componentDidMount() {
    //this.props.connectDragPreview(getEmptyImage())
  }

  render() {
    return (
      this.props.connectDragSource(
        <div className={css(styles.root)}>
          <Attendee attendee={this.props.attendee} />
        </div>
      )
    )
  }
}

const styles = StyleSheet.create({
  root: {
    marginBottom: "10px"
  }
})
  
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
