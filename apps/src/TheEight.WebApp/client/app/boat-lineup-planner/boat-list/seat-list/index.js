import { Component } from "react"
import { observer } from "mobx-react"
import CSSModules from "react-css-modules"
import { compose } from "ramda"

import Seat from "../seat"
import styles from "./styles.css"

function SeatList({ boat }) {
  return (
    <div styleName="root">
      {boat.seats.map(seat => <Seat key={seat.number} boat={boat} seat={seat} />)}
    </div>
  )
}

export default compose(
  observer,
  CSSModules
)(SeatList)
