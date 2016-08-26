import { Component } from "react"
import { DragLayer } from "react-dnd"

import "./AttendeeDragLayer.scss"

@DragLayer(monitor => ({
  item: monitor.getItem(),
  itemType: monitor.getItemType(),
  initialOffset: monitor.getInitialSourceClientOffset(),
  currentOffset: monitor.getSourceClientOffset(),
  isDragging: monitor.isDragging()
}))
export default class AttendeeDragLayer extends Component {
  render() {    
    const displayName = 
      (this.props.itemType === "ASSIGNED_ATTENDEE" || this.props.itemType === "ATTENDEE_LIST_ITEM")
        ? this.props.item.draggedAttendeeName
        : ""

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

    return (
      <div className="drag-layer">
        <div className="attendee card card-block" style={getDragItemStyles(this.props.currentOffset)}>
          {displayName}
        </div>
      </div>
    )
  }
}
