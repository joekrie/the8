import { List, Map, fromJS } from "immutable";
import { Component } from "react";
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import TestBackend from "react-dnd-test-backend";
import TouchBackend from "react-dnd-touch-backend";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";

import AttendeeListContainer from "./containers/attendee-list-container";
import BoatListContainer from "./containers/boat-list-container";
import mapServerDataToState from "./map-server-data-to-state";
import loggerMiddleware from "../common/middleware/logger-middleware";
import appInsightsMiddleware from "../common/middleware/app-insights-middleware";
import reducer from "./reducer";
import sampleState from "./sample-state";

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

export const TouchEnabledBoatLineupPlannerApp = DragDropContext(TouchBackend)(AppBase)
export const ServerSideBoatLineupPlannerApp = DragDropContext(TestBackend)(AppBase)

const BoatLineupPlannerApp = DragDropContext(HTML5Backend)(AppBase)
export default BoatLineupPlannerApp