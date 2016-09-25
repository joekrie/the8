import { DragSource } from "react-dnd"

function beginDrag(props) {
  return { 
    boat: props.boat, 
    seat: props.seat, 
    attendee: props.seat.attendee 
  }
}

function dragCollect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  }
}

const dragSource = DragSource("ASSIGNED_ATTENDEE", { beginDrag }, dragCollect)
export default dragSource
