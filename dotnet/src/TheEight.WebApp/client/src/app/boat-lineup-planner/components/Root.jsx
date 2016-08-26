import "browsernizr/test/touchevents"
import Modernizr from "browsernizr"

import TouchBackend from "react-dnd-touch-backend"
import HTML5Backend from "react-dnd-html5-backend"
import { DragDropContext } from "react-dnd"

import classNames from "classnames"
import { Component } from "react"
import { LocalDate } from "js-joda"
import { observer } from "mobx-react"
import { compose } from "recompose"

//import AttendeeList from "./event-details/AttendeeList"
import BoatList from "./boat-list/BoatList"
import AttendeeDragLayer from "./common/AttendeeDragLayer"

import BoatStore from "../stores/boat-store"

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
  }

  componentDidMount() {
    this.boatStore.load()
  }

  render() {
    return (
      <div className="container-fluid boat-lineup-planner">
        <AttendeeDragLayer />
        <BoatList boats={this.boatStore.boats} />
      </div>
    )
  }
}
