import { observer } from "mobx-react"

import EventDateField from "./event-date-field"
import styles from "./styles.scss"

function EventDetails() {
  return (
    <div className={styles.root}>
      <EventDateField />
    </div>
  )
}

export default observer(EventDetails)
