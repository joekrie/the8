import { List, Map, fromJS } from "immutable";
import { Component } from "react";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";

import Root from "./components/root";
import mapServerDataToState from "./map-server-data-to-state";
import loggerMiddleware from "./middleware/logger";
import BoatRecord from "./records/boat";
import WaterEventRecord from "./records/water-event";
import AttendeeRecord from "./records/attendee";
import reducer from "./reducer";
import sampleState from "./sample-state";

const store = createStore(reducer, { ...sampleState }, applyMiddleware(loggerMiddleware));

class BoatLineupPlannerApp extends Component {
  render() {
    return (
      <Provider store={store}>
        <Root />
      </Provider>
    );
  }
}

export default BoatLineupPlannerApp