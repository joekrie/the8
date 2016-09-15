import { Component, PropTypes } from "react"
import Modal from "react-modal"
import { observer } from "mobx-react"
import { css, StyleSheet } from "aphrodite"
import classNames from "classnames"

import SeatList from "./SeatList"
import BoatModel from "../models/Boat"

function Boat(props) {
  return (
    <div className={classNames("card", css(styles.root))}>
      <header>
        <h3>
          {props.boat.title}
        </h3>
      </header>
      <SeatList boat={props.boat} />
    </div>
  )
}

Boat.propTypes = {
  boat: PropTypes.instanceOf(BoatModel).isRequired
}

const styles = StyleSheet.create({
  root: {
    width: "250px",
    minWidth: "250px",
    marginRight: "20px"
  }
})

export default observer(Boat)
