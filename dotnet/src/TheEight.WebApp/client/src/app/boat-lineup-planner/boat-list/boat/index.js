import { Component, PropTypes } from "react"
import Modal from "react-modal"
import { observer } from "mobx-react"

import SeatList from "../seat-list"
import BoatModel from "../../state/boat"
import styles from "./styles.scss"

function Boat(props) {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <span className={styles.title}>{props.boat.title}</span>
      </header>
      <SeatList boat={props.boat} />
    </div>
  )
}

Boat.propTypes = {
  boat: PropTypes.instanceOf(BoatModel).isRequired
}

export default observer(Boat)
