import { Component } from "react"
import Modal from "react-modal"
import { StyleSheet, css } from "aphrodite"
import classNames from "classnames"

export default class BoatCreator extends Component {  
  constructor() {
    super()

    this.state = {
      name: "",
      isCoxswain: false,
      open: false
    }
  }
  
  resetState() {
    this.setState({
      name: "",
      isCoxswain: false,
      open: false
    })
  }
  
  render() {
    const { createAttendee } = this.props
    
    const onSubmit = () => {
      const { name, isCoxswain } = this.state
      const attendeeId = "new-attendee-" + Date.now()
      
      const newAttendee = new AttendeeRecord({ 
        attendeeId, 
        isCoxswain,
        displayName: name,
        sortName: name
      })
      
      createAttendee(newAttendee)
      this.resetState()
    }

    const openModal = isCoxswain => {
      this.setState({
        open: true, 
        isCoxswain
      })
    }
    
    return (
      <span className="attendee-creator">
        <Modal isOpen={this.state.open} onRequestClose={() => this.resetState()}>
          <fieldset className="form-group">
            <label htmlFor="new-attendee-name">
              Name
            </label>
            <input className="form-control" id="new-attendee-name" value={this.state.name} 
              onChange={evt => this.setState({ name: evt.target.value })} />
          </fieldset>
          <button className="btn btn-primary" onClick={onSubmit}>
            Add
          </button>
        </Modal>
        <button className={classNames("btn btn-secondary btn-sm", css(styles.button))} onClick={() => openModal(false)}>
          Add Rower
        </button>
        <button className={classNames("btn btn-secondary btn-sm", css(styles.button))} onClick={() => openModal(true)}>
          Add Coxswain
        </button>
      </span>
    )
  }
}

const styles = StyleSheet.create({
  button: {
    marginRight: "5px"
  }
})
