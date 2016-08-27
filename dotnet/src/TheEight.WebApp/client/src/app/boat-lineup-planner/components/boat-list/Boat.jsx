import { Component } from "react"
import Modal from "react-modal"
import { observer } from "mobx-react"
import R from "ramda"

//import SeatList from "./SeatList"

import "./Boat.scss"

function Boat(props) {
  return (
    <div className="boat card">
      <div className="header card-header">
        <h3>
          {props.boat.title}
        </h3>
        <a href="#" onClick={() => this.onOpenModal()}>
          details
        </a>
      </div>
      {props.boat.seats.map(num => <div key={num.number}>{num.label}: {JSON.stringify(num.attendee)}</div>)}
      {/*<SeatList seats={props.boat.seats} boatId={props.boat.details.boatId} 
        attendeeIdsInBoat={props.boat.attendeeIdsInBoat} />*/}
    </div>
  )
}

export default observer(Boat)
