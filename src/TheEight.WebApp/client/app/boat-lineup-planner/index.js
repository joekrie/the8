import "browsernizr/test/touchevents"
import Modernizr from "browsernizr"

import classNames from "classnames"
import { List, Map, fromJS } from "immutable"
import { Component } from "react"
import { DragDropContext } from "react-dnd"
import HTML5Backend from "react-dnd-html5-backend"
import TouchBackend from "react-dnd-touch-backend"
import { Provider } from "react-redux"

import AttendeeList from "boat-lineup-planner/containers/attendee-list"
import BoatList from "boat-lineup-planner/containers/boat-list"
import AttendeeDragLayer from "boat-lineup-planner/components/attendee-drag-layer"

import sampleState from "boat-lineup-planner/sample-state"
import initializeStore from "boat-lineup-planner/initialize-store"

import "boat-lineup-planner/styles.scss"

export class AppBase extends Component {
  constructor() {
    super()
    this.store = initializeStore()
  }

  componentDidMount() {
    this.store.dispatch({
      type: "SET_INITIAL_STATE",
      payload: sampleState
    })
  }

  render() {
    return (
      <Provider store={this.store}>
        <div className="container-fluid boat-lineup-planner">
          <AttendeeDragLayer />
          <AttendeeList />
          <BoatList />
        </div>
      </Provider>
    )
  }
}

const backend = 
  Modernizr.touchevents 
    ? TouchBackend({ enableMouseEvents: true })
    : HTML5Backend

const BoatLineupPlannerApp = DragDropContext(backend)(AppBase)
export default BoatLineupPlannerApp
