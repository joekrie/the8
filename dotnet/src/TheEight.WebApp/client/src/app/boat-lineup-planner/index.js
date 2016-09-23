import "browsernizr/test/touchevents"
import Modernizr from "browsernizr"
import TouchBackend from "react-dnd-touch-backend"
import HTML5Backend from "react-dnd-html5-backend"
import { DragDropContext } from "react-dnd"
import { Component } from "react"
import { observer, Provider } from "mobx-react"
import { compose } from "ramda"
import { StyleSheet, css } from "aphrodite"
import classNames from "classnames"

import EventDetails from "./EventDetails"
import BoatList from "./BoatList"
import AttendeeDragLayer from "./AttendeeDragLayer"
import BoatStore from "../stores/BoatStore"
import AttendeeStore from "../stores/AttendeeStore"

class Root extends Component {
  boatStore

  constructor() {
    super()

    this.attendeeStore = new AttendeeStore()
    this.boatStore = new BoatStore(this.attendeeStore)
  }

  componentDidMount() {
    this.boatStore.load()
    this.attendeeStore.load()
  }

  render() {
    return (
      <Provider boatStore={this.boatStore} attendeeStore={this.attendeeStore}>
        <div className={classNames("container-fluid", css(styles.root))}>
          <AttendeeDragLayer />
          <EventDetails />
          <BoatList />
        </div>
      </Provider>
    )
  }
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    height: "100%",
    paddingTop: "15px",
    paddingBottom: "15px"
  }
})

export default compose(
  DragDropContext(Modernizr.touchevents 
    ? TouchBackend({ enableMouseEvents: true }) 
    : HTML5Backend
  ),
  observer
)(Root)
