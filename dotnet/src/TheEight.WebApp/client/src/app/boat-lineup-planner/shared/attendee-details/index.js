import { observer, inject } from "mobx-react"
import { compose } from "ramda"

function AttendeeDetails(props) {
  return (
    <div>
      {props.attendee.displayName}
    </div>
  )
}

export default observer(AttendeeDetails)
