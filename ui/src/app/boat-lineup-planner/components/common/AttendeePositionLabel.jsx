import { Component } from "react"
import Modal from "react-modal"

export default class Attendee extends Component {
  positionLabels = {
    COXSWAIN: {
      abbr: "C",
      title: "Coxswain"
    }, 
    PORT_ROWER: {
      abbr: "P",
      title: "Port"
    },
    STARBOARD_ROWER: {
      abbr: "S",
      title: "Starboard"
    }, 
    BISWEPTUAL_ROWER: {
      abbr: "B",
      title: "Bisweptual"
    }
  }

  render() {
    return (
      <span title={this.positionLabels[this.props.position].title}>
        {this.positionLabels[this.props.position].abbr}
      </span>
    )
  }
}
