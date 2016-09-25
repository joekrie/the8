import { Component } from "react"
import { observer } from "mobx-react"

import Seat from "../seat"
import styles from "./styles.scss"

function SeatList(props) {
  return (
    <div className={styles.root}>
      {props.boat.seats.map(seat =>
        <Seat key={seat.number} boat={props.boat} seat={seat} />
      )}
    </div>
  )
}

export default observer(SeatList)
