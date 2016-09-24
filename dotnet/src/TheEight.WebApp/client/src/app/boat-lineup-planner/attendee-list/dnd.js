function dropCollect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop(),
    itemType: monitor.getItemType()
  }
}

const dropSpec = {
  drop(props, monitor) {
    const draggedItem = monitor.getItem()
    draggedItem.boat.unplaceAttendee(draggedItem.seat.number)
  }
}

const dropTarget = DropTarget("ASSIGNED_ATTENDEE", dropSpec, dropCollect)
export default dropTarget
