import { Component } from "react"
import Modal from "react-modal"
import { observer } from "mobx-react"

//import SeatList from "./SeatList"

import "./Boat.scss"

function Boat(props) {  
  return <div>X</div>

  return (
    <div className="boat card">
      <div className="header card-header">
        <h3>
          {props.boat.details.title}
        </h3>
        <a href="#" onClick={() => this.onOpenModal()}>
          details
        </a>
      </div>
      <SeatList seats={props.boat.allSeats} boatId={props.boat.details.boatId} 
        attendeeIdsInBoat={props.boat.attendeeIdsInBoat} />
    </div>
  )
}

export default observer(Boat)
