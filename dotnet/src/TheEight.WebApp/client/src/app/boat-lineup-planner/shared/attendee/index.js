import { Component, PropTypes } from "react"
import Modal from "react-modal"
import { observer } from "mobx-react"
import { observable, action } from "mobx"
import classNames from "classnames"

import AttendeeDetails from "../attendee-details"
import styles from "./styles.scss"
import dragHandleImage from "../../../../img/drag-handle.svg"

@observer
export default class Attendee extends Component {
  @observable isOpen = false

  @action open() {
    this.isOpen = true
  }

  @action close() {
    this.isOpen = false
  }
  
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired
  }

  render() {
    let displayName = this.props.attendee.displayName

    if (this.props.isOutOfPosition) {
      displayName = displayName.concat("*")
    }

    return this.props.connectDragPreview(
      <div className={classNames(styles.root, {[styles.coxswain]: this.props.attendee.isCoxswain})}>
        {this.props.connectDragSource(
          <div className={classNames(styles.dragHandle, { [styles.isDragging]: this.props.isDragging })}>
            {/*&#9776;*/}
            <img src={dragHandleImage} />
          </div>
        )}
        <button className={styles.attendee} onClick={() => this.open()}>
          <div className={styles.name}>
            {displayName}
            &nbsp;
          </div>
          <div className={styles.position}>
            <span className={styles.positionTooltip} data-tooltip={positionLabels[this.props.attendee.position].title}>
              {positionLabels[this.props.attendee.position].abbr}
            </span>
          </div>
        </button>
        <Modal className={styles.modal} isOpen={this.isOpen} onRequestClose={() => this.close()}>
          <AttendeeDetails attendee={this.props.attendee} />
        </Modal>
      </div>
    )
  }
}

const positionLabels = {
  COXSWAIN: {
    abbr: "C",
    title: "Coxswain"
  }, 
  PORT_ROWER: {
    abbr: "P",
    title: "Port"
  },
  STARBOARD_ROWER: {
    abbr: "S",
    title: "Starboard"
  }, 
  BISWEPTUAL_ROWER: {
    abbr: "B",
    title: "Bisweptual"
  }
}
