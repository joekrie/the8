import { DragSource } from "react-dnd"

export function beginDrag(props) {
  return {
    attendee: props.attendee
  }
}

export function dragCollect(connect) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview()
  }
}

const dragSource = DragSource("ATTENDEE_LIST_ITEM", { beginDrag }, dragCollect)
export default dragSource
