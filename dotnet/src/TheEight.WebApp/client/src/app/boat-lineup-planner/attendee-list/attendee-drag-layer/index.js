import { Component } from "react"

import Attendee from "../attendee"
import dragLayer from "./dnd"
import styles from "./styles.scss"

function getDragItemStyles(currentOffset) {
  if (!currentOffset) {
    return {
      "display": "none"
    }
  }

  const { x, y } = currentOffset
  const transform = `translate(${x}px, ${y}px)`

  return {
    "transform": transform,
    "WebkitTransform": transform
  }
}

@dragLayer
export default class AttendeeDragLayer extends Component {
  render() {
    if (this.props.item && this.props.item.attendee) {
      return (
        <div className={styles.dragLayer}>
          <div style={getDragItemStyles(this.props.currentOffset)}>
            <Attendee attendee={this.props.item.attendee} />
          </div>
        </div>
      )
    }
    
    return (
      <div className={styles.dragLayer}></div>
    )
  }
}
