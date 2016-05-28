import { List, Map, fromJS } from "immutable";
import Radium from "radium";
import { Component } from "react";
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";

import AttendeeListContainer from "./containers/attendee-list-container";
import BoatListContainer from "./containers/boat-list-container";
import mapServerDataToState from "./map-server-data-to-state";
import loggerMiddleware from "./middleware/logger";
import reducer from "./reducer";
import sampleState from "./sample-state";

const store = createStore(reducer, { ...sampleState }, applyMiddleware(loggerMiddleware));

@Radium
@DragDropContext(HTML5Backend)
export default class BoatLineupPlannerApp extends Component {
  render() {
    const styles = {
      "position": "absolute",
      "height": "100%"
    };
    
    return (
      <Provider store={store}>
        <div style={styles}>
          <AttendeeListContainer />
          <BoatListContainer />
        </div>
      </Provider>
    );
  }
}