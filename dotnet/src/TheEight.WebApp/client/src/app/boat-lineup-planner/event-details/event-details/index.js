import { PropTypes } from "react"
import { observer } from "mobx-react"

import AttendeeList from "../attendee-list"
import styles from "./styles.scss"

function EventDetails(props) {
  return (
    <div className={`card ${styles.root}`}>
      <AttendeeList />
    </div>
  )
}

export default observer(EventDetails)
