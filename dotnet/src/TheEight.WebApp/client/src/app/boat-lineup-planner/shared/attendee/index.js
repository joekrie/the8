import { PropTypes } from "react"
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

  return props.connectDragPreview(
    <div className={classNames(styles.root, {[styles.coxswain]: props.attendee.isCoxswain})}>
      {props.connectDragSource(
        <div className={classNames(styles.dragHandle, { [styles.isDragging]: props.isDragging })}>
          &#9776;
        </div>
      )}
      <div className={styles.attendee}>
        <div className={styles.name}>
          {displayName}
          &nbsp;
        </div>
        <div className={styles.position}>
          <AttendeePositionLabel position={props.attendee.position} />
        </div>
      </div>
    </div>
  )
}

Attendee.propTypes = {
  connectDragSource: PropTypes.func.isRequired,
  connectDragPreview: PropTypes.func.isRequired
}

export default observer(Attendee)
