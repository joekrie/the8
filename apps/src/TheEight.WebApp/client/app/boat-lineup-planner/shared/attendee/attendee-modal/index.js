import { observer, inject } from "mobx-react"
import { compose } from "ramda"
import Modal from "react-modal"

import styles from "./styles.scss"
import closeImage from "img/close.svg"
import attendeePositions from "app/common/state/attendee-positions"

function AttendeeModal(props) {
  const outOfPlaceMarker = this.props.isOutOfPosition ? "*" : ""

  return (
    <Modal className={styles.modal} overlayClassName={styles.overlay} 
      isOpen={props.isOpen} onRequestClose={props.close}>
      <button className={styles.close} onClick={props.close}>
        <img src={closeImage} />
      </button>
      <div>
        <div className={styles.name}>
          {this.props.attendee.displayName}
        </div>
        <div className={styles.position}>
          {attendeePositions[props.attendee.position].title}
          {outOfPlaceMarker}
        </div>
      </div>
    </Modal>
  )
}

export default observer(AttendeeModal)
