import { Component } from "react";
import { DragLayer } from "react-dnd";

import { ASSIGNED_ATTENDEE, ATTENDEE_LIST_ITEM } from "../../item-types";
import { collect } from "./dnd";

import "./styles.scss";

const getItemStyles = currentOffset => 
{
  if (!currentOffset) {
    return {
      "display": "none"
    };
  }

  const { x, y } = currentOffset;
  const transform = `translate(${x}px, ${y}px)`;

  return {
    "transform": transform,
    "WebkitTransform": transform,
    "padding": "5px",
    "width": "200px"
  };
}

@DragLayer(collect)
export default class AttendeeDragLayer extends Component {
  render() {
    const { item, itemType, currentOffset } = this.props;

    const displayName = (itemType === ASSIGNED_ATTENDEE || itemType === ATTENDEE_LIST_ITEM)
      ? item.draggedAttendeeName
      : "";
    
    return (
      <div className="drag-layer">
        <div className="card card-block" style={getItemStyles(currentOffset)}>
          {displayName}
        </div>
      </div>
    );
  }
}