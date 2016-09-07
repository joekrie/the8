import { Component } from "react"
import Modal from "react-modal"
import { observer } from "mobx-react"

import AttendeePositionLabel from "./AttendeePositionLabel"

import "./Attendee.scss"

function Attendee(props) {
  let displayName = props.attendee.displayName

  if (props.isOutOfPosition) {
    displayName = displayName.concat("*")
  }

  return (
    <div className="attendee card card-block" 
      style={props.attendee.isCoxswain ? { backgroundColor: "lightgrey" } : {}}>
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
