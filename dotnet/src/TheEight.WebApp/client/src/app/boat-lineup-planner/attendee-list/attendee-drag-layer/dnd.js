import { DragLayer } from "react-dnd"

export function dragCollect(monitor) {
  return {
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging()
  }
}

const dragLayer = DragLayer(dragCollect)
export default dragLayer