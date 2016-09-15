import { Component } from "react"
import { DragLayer } from "react-dnd"
import R from "ramda"
import { StyleSheet, css } from "aphrodite"

import Attendee from "./Attendee"

class AttendeeDragLayer extends Component {
  render() {
    if (this.props.item && this.props.item.attendee) {
      return (
        <div className={css(styles.dragLayer)}>
          <div style={getDragItemStyles(this.props.currentOffset)}>
            <Attendee attendee={this.props.item.attendee} />
          </div>
        </div>
      )
    }
    
    return (
      <div className={css(styles.dragLayer)}></div>
    )
  }
}

const styles = StyleSheet.create({
  dragLayer: {
    position: "fixed",
    pointerEvents: "none",
    zIndex: 100,
    left: 0,
    top: 0,
    width: "100%",
    height: "100%"
  },
  attendee: {
    padding: "0.4rem",
    width: "20rem",
    lineHeight: 1
  }
})

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

function dragCollect(monitor) {
  return {
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging()
  }
}

export default DragLayer(dragCollect)(AttendeeDragLayer)
