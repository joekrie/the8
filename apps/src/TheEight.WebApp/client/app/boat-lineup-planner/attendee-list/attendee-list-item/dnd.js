import { DragSource } from "react-dnd"

export function beginDrag(props) {
  return {
    attendee: props.attendee
  }
}

export function dragCollect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  }
}

const dragSource = DragSource("ATTENDEE_LIST_ITEM", { beginDrag }, dragCollect)
export default dragSource
