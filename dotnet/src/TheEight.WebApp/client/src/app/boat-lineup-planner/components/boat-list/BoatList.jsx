import { Component } from "react"
import { observer, inject } from "mobx-react"
import { compose } from "recompose"
import R from "ramda"

import Boat from "./Boat"

import "./BoatList.scss"

function BoatList(props) {
  return (
    <div className="boat-list">
      {R.map(boat => <Boat key={boat.boatId} boat={boat} />, 
        props.boatStore.boats)}
    </div>
  )
}

export default compose(
  inject("boatStore"),
  observer
)(BoatList)
