import { Component, PropTypes } from "react"
import Modal from "react-modal"
import { observer } from "mobx-react"
import R from "ramda"

import SeatList from "./SeatList"
import BoatModel from "../../models/Boat"

import "./Boat.scss"

function Boat(props) {
  return (
    <div className="boat card">
      <div className="header card-header">
        <h3>
          {props.boat.title}
        </h3>
      </div>
      <SeatList boat={props.boat} />
    </div>
  )
}

Boat.propTypes = {
  boat: PropTypes.instanceOf(BoatModel).isRequired
}

export default observer(Boat)
