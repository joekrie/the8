import { Component } from "react";
import { DragLayer } from "react-dnd";

import { ASSIGNED_ATTENDEE, ATTENDEE_LIST_ITEM } from "../item-types";

const collect = monitor => ({
  item: monitor.getItem(),
  itemType: monitor.getItemType(),
  initialOffset: monitor.getInitialSourceClientOffset(),
  currentOffset: monitor.getSourceClientOffset(),
  isDragging: monitor.isDragging()
});

const getItemStyles = currentOffset => {
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

const layerStyles = {
  "position": "fixed",
  "pointerEvents": "none",
  "zIndex": 100,
  "left": 0,
  "top": 0,
  "width": "100%",
  "height": "100%"
};

@DragLayer(collect)
export default class AttendeeDragLayer extends Component {
  render() {
    const { item, itemType, currentOffset } = this.props;

    const displayName = (itemType === ASSIGNED_ATTENDEE || itemType === ATTENDEE_LIST_ITEM)
      ? item.draggedAttendeeName
      : "";
    
    return (
      <div style={layerStyles}>
        <div className="card card-block" style={getItemStyles(currentOffset)}>
          {displayName}
        </div>
      </div>
    );
  }
}