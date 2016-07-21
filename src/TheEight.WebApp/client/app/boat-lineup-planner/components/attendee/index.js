import { Component } from "react"
import Modal from "react-modal"

import { 
  COXSWAIN, 
  PORT_ROWER, 
  STARBOARD_ROWER, 
  BISWEPTUAL_ROWER
} from "boat-lineup-planner/models/attendees/attendee-positions"

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

  openModal() {
    this.setState({ open: true })
  }

  closeModal() {
    this.setState({ open: false })
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
      <div className="card card-block attendee" style={styles}>
        <Modal isOpen={this.state.open} onRequestClose={() => this.closeModal()}>
          {displayName}
        </Modal>
        <div className="name">
          {displayName}
          &nbsp;
          <span ref={ref => this.positionRef = ref}  title={this.positionLabels[attendee.details.position].title}>
            ({this.positionLabels[attendee.details.position].abbr})
          </span>
        </div>
        <div className="position">
          <a href="#" onClick={() => this.openModal()}>
            details
          </a>
        </div>
      </div>
    )
  }
}
