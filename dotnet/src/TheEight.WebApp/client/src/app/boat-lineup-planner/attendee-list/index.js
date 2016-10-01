import { Component } from "react"
import { observer, inject } from "mobx-react"
import { filter, compose } from "ramda"

import AttendeeListItem from "./attendee-list-item"
import styles from "./styles.scss"
import dropTarget from "./dnd"

function AttendeeList(props) {
  const attendeesToShow = props.attendeeStore.attendees.filter(attn => 
    !props.boatStore.isAttendeePlacedInAnyBoat(attn.attendeeId))

  return props.connectDropTarget(
    <div className={styles.root}>
      <div className={styles.listItems}>
        {attendeesToShow.map(attn => 
          <AttendeeListItem key={attn.attendeeId} attendee={attn} />
        )}
      </div>
    </div>
  )
}

export default compose(
  dropTarget,
  inject("attendeeStore", "boatStore"),
  observer
)(AttendeeList)
