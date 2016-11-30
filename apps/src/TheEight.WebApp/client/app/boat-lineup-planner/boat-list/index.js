import { Component } from "react"
import { observer, inject } from "mobx-react"
import { compose, map } from "ramda"
import CSSModules from "react-css-modules"

import styles from "./styles.css"
import Boat from "./boat"

function BoatList({ boatStore }) {
  return (
    <div styleName="root">
      {boatStore.boats.map(boat => <Boat key={boat.boatId} boat={boat} />)}
    </div>
  )
}

export default compose(
  inject("boatStore"),
  observer,
  CSSModules
)(BoatList)
