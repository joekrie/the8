import { Component } from "react"
import { observer } from "mobx-react"
import R from "ramda"

import Seat from "./Seat"

import "./SeatList.scss"

function SeatList(props) {
  return (
    <div className="card-block">
      {props.boat.seats.map(seat =>
        <Seat key={seat.number} boatId={props.boat.boatId} seat={seat} />
      )}
    </div>
  )
}

export default observer(SeatList)
