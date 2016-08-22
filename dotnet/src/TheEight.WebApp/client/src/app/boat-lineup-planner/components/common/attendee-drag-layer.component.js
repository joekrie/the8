import { Component } from "react"
import { DragLayer } from "react-dnd"
import { compose } from "recompose"

import "./attendee-drag-layer.component.scss"

function AttendeeDragLayer(props) {
  const { 
    item, 
    itemType, 
    currentOffset 
  } = props

  function getDragItemStyles(currentOffset) { 
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

  const displayName = 
    (itemType === "ASSIGNED_ATTENDEE" || itemType === "ATTENDEE_LIST_ITEM")
      ? item.draggedAttendeeName
      : ""
  
  return (
    <div className="drag-layer">
      <div className="attendee card card-block" style={getDragItemStyles(currentOffset)}>
        {displayName}
      </div>
    </div>
  )
}

export default dnd = {
  collect(monitor) {
    return {
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging()
    }
  }
}

export default compose(
  DragLayer(dnd.collect)
)(AttendeeDragLayer)