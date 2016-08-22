import { Component } from "react"
import { pure } from "recompose"

import Seat from "./seat.container"

import "./seat-list.component.scss"

function SeatList(props) {
  const boatSeats = props.seats.map((attendeeId, seatNumber) => (
    <Seat key={seatNumber} boatId={props.boatId} seatNumber={seatNumber} 
      attendeeId={attendeeId} attendeeIdsInBoat={props.attendeeIdsInBoat} />
  )).valueSeq()

  return (
    <div className="card-block">
      {boatSeats}
    </div>
  )
}

export default pure(SeatList)
