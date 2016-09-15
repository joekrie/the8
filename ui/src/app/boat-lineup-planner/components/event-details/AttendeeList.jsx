import { Component } from "react"
import { DropTarget } from "react-dnd"
import { observer, inject } from "mobx-react"
import { filter, compose } from "ramda"
import { StyleSheet, css } from "aphrodite"
import classNames from "classnames"

import AttendeeListItem from "./AttendeeListItem"

function AttendeeList(props) {
  const attendeesToShow = props.attendeeStore.attendees.filter(attn => 
    !props.boatStore.isAttendeePlacedInAnyBoat(attn.attendeeId))

  return props.connectDropTarget(
    <div className={classNames("card", css(styles.listItems))}>
      <div className={css(styles.listItems)}>
        {attendeesToShow.map(attn => 
          <AttendeeListItem key={attn.attendeeId} attendee={attn} />
        )}
      </div>
    </div>
  )
}

const styles = StyleSheet.create({
  root: {
    height: "500px"
  },
  listItems: {
    paddingTop: "15px"
  }
})

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

export default compose(
  DropTarget("ASSIGNED_ATTENDEE", dropSpec, dropCollect),
  inject("attendeeStore", "boatStore"),
  observer
)(AttendeeList)
