import { Component } from "react"
import Modal from "react-modal"
import { observer } from "mobx-react"

import AttendeePositionLabel from "./AttendeePositionLabel"

import "./Attendee.scss"

function Attendee(props) {
  const { 
    attendee, 
    isOutOfPosition = false 
  } = props

  const styles = 
    attendee.isCoxswain
      ? { backgroundColor: "lightgrey" }
      : {}

  const displayName = attendee.displayName + (isOutOfPosition ? "*" : "")

  return (
    <div className="attendee card card-block" style={styles}>
      <Modal isOpen={this.state.open} onRequestClose={() => this.closeModal()}>
        {displayName}
      </Modal>
      <div className="name">
        {displayName}
        &nbsp;
        <AttendeePositionLabel position={attendee.position} />
      </div>
      <div className="position">
        <a href="#" onClick={() => this.openModal()}>
          details
        </a>
      </div>
    </div>
  )
}

export default observer(Attendee)
