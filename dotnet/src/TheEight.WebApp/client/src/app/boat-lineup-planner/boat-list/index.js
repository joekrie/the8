import { Component } from "react"
import { observer, inject } from "mobx-react"
import { compose, map } from "ramda"

import styles from "./styles.scss"
import Boat from "./boat"

function BoatList(props) {
  return (
    <div className={styles.root}>
      {map(boat => <Boat key={boat.boatId} boat={boat} />, props.boatStore.boats)}
    </div>
  )
}

export default compose(
  inject("boatStore"),
  observer
)(BoatList)
