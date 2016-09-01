import { Component } from "react"
import { DragLayer } from "react-dnd"
import R from "ramda"

import Attendee from "./Attendee"

import "./AttendeeDragLayer.scss"

class AttendeeDragLayer extends Component {
  render() {
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

    if (this.props.item && this.props.item.attendee) {
      return (
        <div className="drag-layer">
          <div style={getDragItemStyles(this.props.currentOffset)}>
            <Attendee attendee={this.props.item.attendee} />
          </div>
        </div>
      )
    }
    
    return (
      <div className="drag-layer"></div>
    )
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
