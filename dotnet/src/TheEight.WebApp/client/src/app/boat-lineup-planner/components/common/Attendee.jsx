import { Component } from "react"
import Modal from "react-modal"
import { pure, compose } from "recompose"

import addModalState from "common/components/add-modal-state.hoc"
import AttendeePositionLabel from "./attendee-position-label.component"

import "./attendee.component.scss"

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

export default compose(
  pure,
  addModalState("attendee")
)(Attendee)
