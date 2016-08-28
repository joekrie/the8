import "browsernizr/test/touchevents"
import Modernizr from "browsernizr"

import TouchBackend from "react-dnd-touch-backend"
import HTML5Backend from "react-dnd-html5-backend"
import { DragDropContext } from "react-dnd"

import classNames from "classnames"
import { Component } from "react"
import { observer, Provider } from "mobx-react"

//import AttendeeList from "./event-details/AttendeeList"
import BoatList from "./boat-list/BoatList"
import AttendeeDragLayer from "./common/AttendeeDragLayer"

import BoatStore from "../stores/BoatStore"
import AttendeeStore from "../stores/AttendeeStore"

import "./Root.scss"

const backend =
  Modernizr.touchevents
    ? TouchBackend({ enableMouseEvents: true })
    : HTML5Backend

@DragDropContext(backend)
@observer
export default class Root extends Component {
  boatStore

  constructor() {
    super()

    this.boatStore = new BoatStore()
    this.attendeeStore = new AttendeeStore()
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
          <BoatList />
        </div>
      </Provider>
    )
  }
}
