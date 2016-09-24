import { Component } from "react"
import { observer } from "mobx-react"

import Seat from "../seat"

function SeatList(props) {
  return (
    <div className="card-block">
      {props.boat.seats.map(seat =>
        <Seat key={seat.number} boat={props.boat} seat={seat} />
      )}
    </div>
  )
}

export default observer(SeatList)
