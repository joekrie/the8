import { Component } from "react"
import Modal from "react-modal"
import { observe } from "mobx"
import { observer } from "mobx-react"

@observer
export default class BoatModal extends Component {  
  @observe open = false

  onCloseModal() {
    this.setState({ open: false })
  }

  onOpenModal() {
    this.setState({ open: true })
  }

  render() {
    return (
      <div>
        <Modal isOpen={this.open} onRequestClose={() => this.openModal = false}>
          {this.props.boat.details.title}
        </Modal>
        <div>
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
