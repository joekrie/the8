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

import sampleState from "./sample-state"
import defaultState from "boat-lineup-planner/default-state"
import mapServerDataToState from "./map-server-data-to-state"
import sampleServerData from "./sample-server-data"

import "./styles.scss"

export class AppBase extends Component {
  componentDidMount() {
    const stateFromServer = mapServerDataToState(sampleServerData)
    console.log(stateFromServer)
    store.dispatch(replaceState(sampleState))
  }

  render() {
    return (
      <Provider store={store}>
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
