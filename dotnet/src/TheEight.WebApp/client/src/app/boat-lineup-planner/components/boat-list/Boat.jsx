import { Component } from "react"
import Modal from "react-modal"
import { observer } from "mobx-react"
import R from "ramda"

import SeatList from "./SeatList"

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
      <SeatList seats={props.boat.seats} boat={props.boat} />
    </div>
  )
}

export default observer(Boat)
