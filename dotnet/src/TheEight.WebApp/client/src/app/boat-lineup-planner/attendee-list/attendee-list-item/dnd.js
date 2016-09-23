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