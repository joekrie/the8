import Radium from "radium";
import { Component } from "react";
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";

import AttendeeListContainer from "../containers/attendee-list";
import BoatListContainer from "../containers/boat-list";

@Radium
@DragDropContext(HTML5Backend)
class Root extends Component {
  render() {
    const styles = {
      root: {
        "position": "absolute",
        "height": "100%"
      }
    };

    return (
      <div style={styles.root}>
        <AttendeeListContainer />
        <BoatListContainer />
      </div>
    );
  }
}

export default Root