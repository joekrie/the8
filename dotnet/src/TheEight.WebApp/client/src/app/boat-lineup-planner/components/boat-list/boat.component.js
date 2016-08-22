import { Component } from "react"
import Modal from "react-modal"
import { pure } from "recompose"

import SeatList from "./seat-list.component"

import "./boat.component.scss"

function Boat(props) {  
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
}

export default pure(Boat)
