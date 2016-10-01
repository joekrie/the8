import { Component, PropTypes } from "react"
import { observer } from "mobx-react"
import { observable, action } from "mobx"
import classNames from "classnames"

import AttendeeModal from "./attendee-modal"
import styles from "./styles.scss"
import dragHandleImage from "img/drag-handle.svg"
import attendeePositions from "app/common/state/attendee-positions"

@observer
export default class Attendee extends Component {  
  @observable isOpen = false

  @action open() {
    this.isOpen = true
  }

  @action close() {
    this.isOpen = false
  }

  render() {
    const outOfPlaceMarker = this.props.isOutOfPosition ? "*" : ""

    const rootClasses = classNames(styles.root, {
      [styles.coxswain]: this.props.attendee.isCoxswain, 
      [styles.isDragging]: this.props.isDragging
    })

    return this.props.connectDragPreview(
      <div className={rootClasses}>
        {this.props.connectDragSource(
          <div className={styles.dragHandle}>
            <img className={styles.dragHandleImage} src={dragHandleImage} />
          </div>
        )}
        <button className={styles.attendee} onClick={() => this.open()}>
          <div className={styles.info}>
            <div className={styles.name}>
              {this.props.attendee.displayName}
            </div>
            <div className={styles.position}>
              {attendeePositions[this.props.attendee.position].title}
              {outOfPlaceMarker}
            </div>
          </div>
          <div className={styles.metric}>
            {this.props.attendee.metric}
          </div>
        </button>
        <AttendeeModal isOpen={this.isOpen} close={() => this.close()} 
          attendee={this.props.attendee} />
      </div>
    )
  }  
  
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired
  }
}
