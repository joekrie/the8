import { DragSource } from "react-dnd"

function beginDrag(props) {
  props.seat.attendee.startDragging()
  
  return { 
    boat: props.boat, 
    seat: props.seat, 
    attendee: props.seat.attendee 
  }
}

function endDrag(props) {
  props.seat.attendee.stopDragging()
}

function dragCollect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

const dragSource = DragSource("ASSIGNED_ATTENDEE", { beginDrag, endDrag }, dragCollect)
export default dragSource
