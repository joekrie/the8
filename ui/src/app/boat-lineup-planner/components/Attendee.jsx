import { Component } from "react"
import Modal from "react-modal"
import { observer } from "mobx-react"
import { StyleSheet, css } from "aphrodite"
import classNames from "classnames"

import AttendeePositionLabel from "./AttendeePositionLabel"

function Attendee(props) {
  let displayName = props.attendee.displayName

  if (props.isOutOfPosition) {
    displayName = displayName.concat("*")
  }

  return (
    <div className={classNames("card", css(styles.attendee), { [css(styles.coxswain)]: props.attendee.isCoxswain })}>
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

const styles = StyleSheet.create({
  attendee: {
    display: "flex",
    padding: "0.4rem",
    lineHeight: 1,
    cursor: "move"
  },
  coxswain: {
    backgroundColor: "lightgrey"
  },
  position: {
    marginLeft: "auto"
  }
})

export default observer(Attendee)
