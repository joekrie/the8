import { Component } from "react";

import { COXSWAIN, PORT_ROWER, STARBOARD_ROWER, BISWEPTUAL_ROWER } from "../models/attendee-positions";

export default class Attendee extends Component {
  render() {
    const { attendee, isOutOfPosition = false } = this.props;
    
    const positionLabels = {
      [COXSWAIN]: "C", 
      [PORT_ROWER]: "P", 
      [STARBOARD_ROWER]: "S", 
      [BISWEPTUAL_ROWER]: "B"
    }
    
    const styles = {
      root: {
        "display": "flex"
      },
      name: {},
      position: {
        "marginLeft": "auto"
      }
    };
    
    const displayName = attendee.displayName + (isOutOfPosition ? "*" : "");
    
    return (
      <div style={styles.root}>
        <div style={styles.name}>
          {displayName}
        </div>
        <div style={styles.position}>
          {positionLabels[attendee.position]}
        </div>
      </div>
    );
  }
}