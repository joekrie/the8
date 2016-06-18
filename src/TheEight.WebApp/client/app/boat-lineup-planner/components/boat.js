import { Component } from "react"
import Modal from "react-modal";

import SeatList from "./seat-list";

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
        "marginRight": "20px"
      },
      header: {
        "marginBottom": "10px",
        "padding": "10px",
        "marginLeft": "auto"
      }
    };

    return (
      <div className="card" style={styles.root}>
        <Modal isOpen={this.state.open} onRequestClose={() => this.setState({ open: false })}>
          {boat.details.title}
        </Modal>
        <div className="card-header" style={styles.header}>
          <h3>
            <a onClick={() => this.setState({ open: true })}>
              {boat.details.title}
            </a>
          </h3>
        </div>
        <SeatList seats={boat.allSeats} boatId={boat.details.boatId} 
          attendeeIdsInBoat={boat.attendeeIdsInBoat} />
      </div>
    );
  }
}