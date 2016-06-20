import { Component } from "react"
import Modal from "react-modal"

import { 
  COXSWAIN, 
  PORT_ROWER, 
  STARBOARD_ROWER, 
  BISWEPTUAL_ROWER
} from "../../models/attendee-positions"

import "./styles.scss"

export default class Attendee extends Component {
  constructor() {
    super()

    this.state = {
      open: false
    }
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
  }

  componentDidMount() {
    $(this.positionRef).tooltip({
      placement: "right"
    })
  }

  render() {
    const { 
      attendee, 
      isOutOfPosition = false 
    } = this.props

    const styles = 
      attendee.isCoxswain
        ? { backgroundColor: "lightgrey" }
        : {}
    
    const displayName = attendee.displayName + (isOutOfPosition ? "*" : "")
    
    return (
      <a onClick={() => this.setState({ open: true })}>
        <div className="card card-block attendee" style={styles}>
          <Modal isOpen={this.state.open} onRequestClose={() => this.setState({ open: false })}>
            {displayName}
          </Modal>
          <div className="name">
            {displayName}
          </div>
          <div className="position" ref={ref => this.positionRef = ref} 
            title={this.positionLabels[attendee.position].title}>
            {this.positionLabels[attendee.position].abbr}
          </div>
        </div>
      </a>
    )
  }
}