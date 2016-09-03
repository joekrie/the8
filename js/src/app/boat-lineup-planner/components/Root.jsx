import "browsernizr/test/touchevents"
import Modernizr from "browsernizr"
import TouchBackend from "react-dnd-touch-backend"
import HTML5Backend from "react-dnd-html5-backend"
import { DragDropContext } from "react-dnd"
import classNames from "classnames"
import { Component } from "react"
import { observer, Provider } from "mobx-react"
import { compose } from "ramda"

import EventDetails from "./event-details/EventDetails"
import BoatList from "./boat-list/BoatList"
import AttendeeDragLayer from "./common/AttendeeDragLayer"
import BoatStore from "../stores/BoatStore"
import AttendeeStore from "../stores/AttendeeStore"

import "./Root.scss"

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
        <div className="container-fluid boat-lineup-planner">
          <AttendeeDragLayer />
          <EventDetails />
          <BoatList />
        </div>
      </Provider>
    )
  }
}

export default compose(
  DragDropContext(Modernizr.touchevents 
    ? TouchBackend({ enableMouseEvents: true }) 
    : HTML5Backend
  ),
  observer
)(Root)
