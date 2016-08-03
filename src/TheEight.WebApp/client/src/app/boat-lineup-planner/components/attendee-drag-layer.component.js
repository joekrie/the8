import { Component } from "react"
import { DragLayer } from "react-dnd"

import "./attendee-drag-layer.component.scss"

export const collect = monitor => ({
  item: monitor.getItem(),
  itemType: monitor.getItemType(),
  initialOffset: monitor.getInitialSourceClientOffset(),
  currentOffset: monitor.getSourceClientOffset(),
  isDragging: monitor.isDragging()
});

export const getDragItemStyles = currentOffset => 
{
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

@DragLayer(collect)
export default class AttendeeDragLayer extends Component {
  render() {
    const { 
      item, 
      itemType, 
      currentOffset 
    } = this.props

    const displayName = 
      (itemType === "ASSIGNED_ATTENDEE" || itemType === "ATTENDEE_LIST_ITEM")
        ? item.draggedAttendeeName
        : ""
    
    return (
      <div className="drag-layer">
        <div className="attendee" style={getDragItemStyles(currentOffset)}>
          {displayName}
        </div>
      </div>
    )
  }
}