import { Component } from "react"
import { observer } from "mobx-react"
import R from "ramda"

import Boat from "./Boat"

import "./BoatList.scss"

function BoatList(props) {
  const mapBoats = R.pipe(
    R.values,
    R.map(boat => <Boat key={boat.boatId} boat={boat} />)
  )

  return (
    <div className="boat-list">
      {mapBoats(props.boats)}
    </div>
  )
}

export default observer(BoatList)
