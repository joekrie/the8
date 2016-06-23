import "browsernizr/test/touchevents";
import Modernizr from "browsernizr";

import classNames from "classnames";
import { List, Map, fromJS } from "immutable";
import { Component } from "react";
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import TouchBackend from "react-dnd-touch-backend";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";

import AttendeeList from "boat-lineup-planner/containers/attendee-list";
import BoatList from "boat-lineup-planner/containers/boat-list";
import AttendeeDragLayer from "boat-lineup-planner/components/attendee-drag-layer";

import loggerMiddleware from "common/middleware/logger-middleware";
import appInsightsMiddleware from "common/middleware/app-insights-middleware";
import reducer from "boat-lineup-planner/reducer";
import sampleState from "./sample-state";

import "./styles.scss"

const store = createStore(
  reducer,
  { ...sampleState },
  applyMiddleware(
    loggerMiddleware,
    appInsightsMiddleware
  )
);

export class AppBase extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className={classNames("container-fluid", "boat-lineup-planner")}>
          <AttendeeDragLayer />
          <AttendeeList />
          <BoatList />
        </div>
      </Provider>
    );
  }
}

const backend = Modernizr.touchevents 
    ? TouchBackend({ enableMouseEvents: true })
    : HTML5Backend;

const BoatLineupPlannerApp = DragDropContext(backend)(AppBase);
export default BoatLineupPlannerApp;