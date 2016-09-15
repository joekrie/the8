import { Component } from "react"
import { observer, inject } from "mobx-react"
import { compose, map } from "ramda"
import { css, StyleSheet } from "aphrodite"

import Boat from "./Boat"

function BoatList(props) {
  return (
    <div className={css(styles.root)}>
      {map(boat => <Boat key={boat.boatId} boat={boat} />, 
        props.boatStore.boats)}
    </div>
  )
}

const styles = StyleSheet.create({
  root: {
    marginTop: "0px",
    marginBottom: "0px",
    paddingLeft: "20px",
    display: "flex",
    overflowX: "auto",
    alignItems: "flex-start",
    height: "100%"
  }
})

export default compose(
  inject("boatStore"),
  observer
)(BoatList)
