import { List } from "immutable"
import { Component } from "react"
import { observer } from "mobx-react"

import Boat from "./boat.component"

import "./boat-list.container.scss"

function BoatList(props) {
  const boatComponents = props.boats.map(boat => 
    <Boat key={boat.boat.boatId} boat={boat} />
  )

  return (
    <div className="boat-list">
      {boatComponents}
    </div>
  )
}

export default observer(BoatList)
