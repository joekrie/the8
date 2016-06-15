import { Component } from "react"
import Modal from "react-modal";

import SeatList from "./seat-list";
import SeatRecord from "../models/seat-record";

export default class Boat extends Component {  
  constructor() {
    super();

    this.state = {
      open: false
    }
  }

  render() {
    const { boat } = this.props;
    
    const styles = {
      root: {
        "width": "300px",
        "backgroundColor": "#263751",
        "display": "inline-block",
        "marginRight": "20px",
        "color": "#F5F5F5"
      },
      header: {
        "backgroundColor": "#263F52",
        "marginBottom": "10px",
        "padding": "10px"
      }
    };

    return (
      <div style={styles.root}>
        <Modal isOpen={this.state.open} onRequestClose={() => this.setState({ open: false })}>
          {boat.details.title}
        </Modal>        
        <div style={styles.header}>
          {boat.details.title}&nbsp;
          <button onClick={() => this.setState({ open: true })}>
            Details
          </button>
        </div>
        <SeatList seats={boat.allSeats} boatId={boat.details.boatId} 
          attendeeIdsInBoat={boat.attendeeIdsInBoat} />
      </div>
    );
  }
}