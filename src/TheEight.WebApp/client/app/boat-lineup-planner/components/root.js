import Radium from "radium";
import { Component } from "react";
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";

import AttendeeListContainer from "../containers/attendee-list-container";
import BoatListContainer from "../containers/boat-list-container";

@Radium
export class Root extends Component {
  render() {
    const styles = {
      "position": "absolute",
      "height": "100%"
    };

    return (
      <div style={styles}>
        <AttendeeListContainer />
        <BoatListContainer />
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(Root);