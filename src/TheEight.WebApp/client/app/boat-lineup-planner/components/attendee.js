import { Component } from "react";
import Modal from "react-modal";
import $ from "jquery";
import "bootstrap";

import { 
  COXSWAIN, 
  PORT_ROWER, 
  STARBOARD_ROWER, 
  BISWEPTUAL_ROWER
} from "../models/attendee-positions";

export default class Attendee extends Component {
  constructor() {
    super();

    this.state = {
      open: false
    };
  }

  positionLabels = {
    [COXSWAIN]: {
      abbr: "C",
      title: "Coxswain"
    }, 
    [PORT_ROWER]: {
      abbr: "P",
      title: "Port"
    },
    [STARBOARD_ROWER]: { 
      abbr: "S",
      title: "Starboard"
    }, 
    [BISWEPTUAL_ROWER]: {
      abbr: "B",
      title: "Bisweptual"
    }
  };

  render() {
    const { 
      attendee, 
      isOutOfPosition = false 
    } = this.props;
    
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
        <Modal isOpen={this.state.open} onRequestClose={() => this.setState({ open: false })}>
          {displayName}
        </Modal>
        <div style={styles.name}>
          {displayName}&nbsp;
          <button onClick={() => this.setState({ open: true })}>
            Details
          </button>
        </div>
        <div style={styles.position} title={this.positionLabels[attendee.position].title}>
          {this.positionLabels[attendee.position].abbr}
        </div>
      </div>
    );
  }
}