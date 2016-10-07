import { observer, inject } from "mobx-react"
import { Component } from "react"
import { compose } from "ramda"
import Modal from "react-modal"
import classNames from "classnames"
import { observable, action } from "mobx"

import styles from "./styles.scss"
import closeImage from "img/close.svg"
import attendeePositions from "app/common/state/attendee-positions"

const boatTypes = [
  {
    description: "1x",
    seatCount: 1,
    isCoxed: false
  },
  {
    description: "2x/2-",
    seatCount: 2,
    isCoxed: false
  },
  {
    description: "4x/4-",
    seatCount: 4,
    isCoxed: false
  },
  {
    description: "4+",
    seatCount: 4,
    isCoxed: true
  },
  {
    description: "8+",
    seatCount: 8,
    isCoxed: true
  }
]

@observer
export default class AddBoatModal extends Component {
  @observable selectedBoatType = "1x"

  render() {
    return (
      <Modal className={styles.modal} overlayClassName={styles.overlay} 
        isOpen={this.props.isOpen} onRequestClose={this.props.close}>
        <button className={styles.close} onClick={this.props.close}>
          <img src={closeImage} />
        </button>
        <div>
          <div>
            {boatTypes.map(type => (
              <button key={type.description} className={classNames(styles.boatType, {[styles.selected]: this.selectedBoatType == type.description})}>
                {type.description}
              </button>
            ))}
          </div>
          <div>
            <label>
              Name
              <input />
            </label>
          </div>
        </div>
      </Modal>
    )
  }
}
