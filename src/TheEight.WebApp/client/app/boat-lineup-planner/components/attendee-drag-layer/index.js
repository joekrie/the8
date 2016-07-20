import { Component } from "react"
import { DragLayer } from "react-dnd"

import { collect, getDragItemStyles } from "./dnd"

import "./styles.scss"

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
        <div className="attendee card card-block" style={getDragItemStyles(currentOffset)}>
          {displayName}
        </div>
      </div>
    )
  }
}