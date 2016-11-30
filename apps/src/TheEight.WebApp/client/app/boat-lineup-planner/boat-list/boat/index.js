import { Component, PropTypes } from "react"
import Modal from "react-modal"
import { observer } from "mobx-react"
import CSSModules from "react-css-modules"
import { compose } from "ramda"

import SeatList from "../seat-list"
import BoatModel from "../../state/boat"
import styles from "./styles.css"

function Boat({ boat }) {
  const headerStyles = {
    backgroundColor: boat.color.toJS().background.css(),
    color: boat.color.toJS().text.css()
  }

  return (
    <div className={styles.root}>
      <header style={headerStyles} className={styles.header}>
        <span className={styles.title}>{boat.title}</span>
      </header>
      <SeatList boat={boat} />
    </div>
  )
}

Boat.propTypes = {
  boat: PropTypes.instanceOf(BoatModel).isRequired
}

export default compose(
  observer,
  CSSModules(styles)
)(Boat)
