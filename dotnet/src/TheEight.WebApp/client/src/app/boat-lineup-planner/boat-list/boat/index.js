import { Component, PropTypes } from "react"
import Modal from "react-modal"
import { observer } from "mobx-react"

import SeatList from "../seat-list"
import BoatModel from "../boat-model"
import styles from "./styles.scss"

function Boat(props) {
  return (
    <div className={`card ${styles.root}`}>
      <header>
        <h3>
          {props.boat.title}
        </h3>
      </header>
      <SeatList boat={props.boat} />
    </div>
  )
}

Boat.propTypes = {
  boat: PropTypes.instanceOf(BoatModel).isRequired
}

export default observer(Boat)
