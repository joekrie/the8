import { Component } from "react"
import Modal from "react-modal"
import { observer } from "mobx-react"
import classNames from "classnames"

import AttendeePositionLabel from "../attendee-position-label"
import styles from "./styles.scss"

function Attendee(props) {
  let displayName = props.attendee.displayName

  if (props.isOutOfPosition) {
    displayName = displayName.concat("*")
  }

  return (
    <div className={classNames("card", styles.attendee, { [styles.coxswain]: props.attendee.isCoxswain })}>
      <div className="name">
        {displayName}
        &nbsp;
      </div>
      <div className="position">
        <AttendeePositionLabel position={props.attendee.position} />
      </div>
    </div>
  )
}

export default observer(Attendee)
