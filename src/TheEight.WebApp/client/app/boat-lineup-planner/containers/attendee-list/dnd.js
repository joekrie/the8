export const dropSpec = {
  drop(props, monitor) {
    const { unassignAttendee } = props
    const { originBoatId, originSeatNumber } = monitor.getItem()

    moveAttendeesRequest([
      unassignAttendee(originBoatId, originSeatNumber)
    ])
  }
}
