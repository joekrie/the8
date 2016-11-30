import { Component } from "react"
import { observer, inject } from "mobx-react"
import { filter, compose } from "ramda"
import CSSModules from "react-css-modules"

import AttendeeListItem from "./attendee-list-item"
import styles from "./styles.css"
import dropTarget from "./dnd"

function AttendeeList({ attendeeStore, boatStore, connectDropTarget }) {
  const attendeesToShow = attendeeStore.attendees.filter(attn => 
    !boatStore.isAttendeePlacedInAnyBoat(attn.attendeeId))

  return connectDropTarget(
    <div styleName="root">
      <div styleName="list-items">
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
  observer,
  CSSModules(styles)
)(AttendeeList)
