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
        "width": "250px",
        "minWidth": "250px",
        "display": "inline-block",
        "marginRight": "20px",
        "border": "1px solid black"
      },
      header: {
        "marginBottom": "10px",
        "padding": "10px",
        "borderBottom": "1px solid black"
      }
    };

    return (
      <div style={styles.root}>
        <Modal isOpen={this.state.open} onRequestClose={() => this.setState({ open: false })}>
          {boat.details.title}
        </Modal>        
        <div className="container" style={styles.header}>
          {boat.details.title}&nbsp;
          <button className="btn btn-secondary btn-sm" onClick={() => this.setState({ open: true })}>
            Details
          </button>
        </div>
        <SeatList seats={boat.allSeats} boatId={boat.details.boatId} 
          attendeeIdsInBoat={boat.attendeeIdsInBoat} />
      </div>
    );
  }
}