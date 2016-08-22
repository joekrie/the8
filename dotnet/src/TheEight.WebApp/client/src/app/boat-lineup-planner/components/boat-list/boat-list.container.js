import { List } from "immutable"
import { Component } from "react"
import { connect } from "react-redux"
import { compose, pure } from "recompose"

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

export const redux = {
  mapStateToProps(state) {
    return {
      boats: boats.valueSeq()
    }
  }
}

export default connect(
  redux.mapStateToProps,
  pure
)(BoatList)
