import { Component } from "react"
import Modal from "react-modal"

import SeatList from "boat-lineup-planner/components/seat-list"

import "./boat.component.scss"

export default class Boat extends Component {  
  constructor() {
    super()

    this.state = {
      open: false
    }
  }

  onCloseModal() {
    this.setState({ open: false })
  }

  onOpenModal() {
    this.setState({ open: true })
  }

  render() {
    const { boat } = this.props

    return (
      <div className="boat card">
        <Modal isOpen={this.state.open} onRequestClose={() => this.onCloseModal()}>
          {boat.details.title}
        </Modal>
        <div className="header card-header">
          <h3>
            {boat.details.title}
          </h3>
          <a href="#" onClick={() => this.onOpenModal()}>
            details
          </a>
        </div>
        <SeatList seats={boat.allSeats} boatId={boat.details.boatId} 
          attendeeIdsInBoat={boat.attendeeIdsInBoat} />
      </div>
    )
  }
}
 