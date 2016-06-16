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

  componentDidMount() {
    $(this.positionRef).tooltip({
      placement: "right"
    });
  }

  render() {
    const { 
      attendee, 
      isOutOfPosition = false 
    } = this.props;
    
    const styles = {
      root: {
        "display": "flex",
        "cursor": "grab",
        "border": "1px solid black",
        "padding": "5px"
      },
      name: {},
      position: {
        "marginLeft": "auto"
      }
    };

    if (attendee.isCoxswain) {
      styles.root["backgroundColor"] = "lightgrey";
    }
    
    const displayName = attendee.displayName + (isOutOfPosition ? "*" : "");
    
    return (
      <div style={styles.root}>
        <Modal isOpen={this.state.open} onRequestClose={() => this.setState({ open: false })}>
          {displayName}
        </Modal>
        <div style={styles.name}>
          {displayName}&nbsp;
          <a onClick={() => this.setState({ open: true })}>
            Details
          </a>
        </div>
        <div style={styles.position} ref={ref => this.positionRef = ref} 
          title={this.positionLabels[attendee.position].title}>
          {this.positionLabels[attendee.position].abbr}
        </div>
      </div>
    );
  }
}