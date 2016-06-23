import { Component } from "react"
import Modal from "react-modal"

import SeatList from "boat-lineup-planner/components/seat-list"

import "./styles.scss"

export default class Boat extends Component {  
  constructor() {
    super();

    this.state = {
      open: false
    }
  }

  render() {
    const { boat } = this.props;

    return (
      <div className="boat card">
        <Modal isOpen={this.state.open} onRequestClose={() => this.setState({ open: false })}>
          {boat.details.title}
        </Modal>
        <div className="header card-header">
          <h3>
            <a onClick={() => this.setState({ open: true })}>
              {boat.details.title}
            </a>
          </h3>
        </div>
        <SeatList seats={boat.allSeats} boatId={boat.details.boatId} 
          attendeeIdsInBoat={boat.attendeeIdsInBoat} />
      </div>
    )
  }
}