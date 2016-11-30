import { Component } from "react"
import CSSModules from "react-css-modules"
import { compose } from "ramda"

import Attendee from "../../shared/attendee"
import dragSource from "./dnd"
import styles from "./styles.css"

function AttendeeListItem({ attendee, isDragging, connectDragSource, connectDragPreview }) {
  const draggingStyle = isDragging ? 'is-dragging' : null

  return (
    <div styleName="list-item">
      <div styleName={draggingStyle}>
        <Attendee attendee={attendee} connectDragSource={connectDragSource} 
          connectDragPreview={connectDragPreview} />
      </div>
    </div>
  )
}

export default compose(
  dragSource,
  CSSModules(styles)
)(AttendeeListItem)