import { Component } from "react"
import classNames from "classnames"

import Attendee from "../../shared/attendee"
import dragSource from "./dnd"
import styles from "./styles.scss"

function AttendeeListItem(props) {
  return (
    <div className={styles.listItem}>
      <div className={classNames({[styles.isDragging]: props.isDragging})}>
        <Attendee attendee={props.attendee} connectDragSource={props.connectDragSource} 
          connectDragPreview={props.connectDragPreview} />
      </div>
    </div>
  )
}

export default dragSource(AttendeeListItem)