import { Component } from "react"
import Modal from "react-modal"
import { observe } from "mobx"
import { observer } from "mobx-react"

import SeatList from "./seat-list.component"

import "./boat.component.scss"

@observer
export default class Boat extends Component {  
  @observe open = false

  onCloseModal() {
    this.setState({ open: false })
  }

  onOpenModal() {
    this.setState({ open: true })
  }

  render() {
    return (
      <div className="boat card">
        <Modal isOpen={this.open} onRequestClose={() => this.openModal = false}>
          {this.props.boat.details.title}
        </Modal>
        <div className="header card-header">
          <h3>
            {this.props.boat.details.title}
          </h3>
          <a href="#" onClick={() => this.openModal = true}>
            details
          </a>
        </div>
      </div>
    )
  }
}
