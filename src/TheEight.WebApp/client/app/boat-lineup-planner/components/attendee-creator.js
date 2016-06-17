import { Component } from "react";
import Modal from "react-modal";

import AttendeeRecord from "../models/attendee-record";

export default class BoatCreator extends Component {  
  constructor() {
    super();    
    this.state = {
      name: "",
      isCoxswain: false,
      open: false
    };
  }
  
  resetState() {
    this.setState({
      name: "",
      isCoxswain: false,
      open: false
    });
  }
  
  render() {
    const { createAttendee } = this.props;
    
    const onSubmit = () => {
      const { name, isCoxswain } = this.state;
      const attendeeId = "new-attendee-" + Date.now();
      
      const newAttendee = new AttendeeRecord({ 
        attendeeId, 
        isCoxswain,
        displayName: name,
        sortName: name
      });
      
      createAttendee(newAttendee);
      this.resetState();
    };
    
    const getTypeValue = () => {
      const { seatCount, isCoxed } = this.state;
      return String(seatCount) + (isCoxed ? "+" : "x");
    };

    const openModal = isCoxswain => {
      this.setState({
        open: true, 
        isCoxswain
      });
    };

    const styles = {
      button: {
        "marginRight": "5px"
      }
    };
    
    return (
      <span>
        <Modal isOpen={this.state.open} onRequestClose={() => this.resetState()}>
          <button className="btn btn-secondary" onClick={() => this.resetState()}>
            Close
          </button>
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
        <button className="btn btn-secondary" style={styles.button} onClick={() => openModal(false)}>
          Add Rower
        </button>
        <button className="btn btn-secondary" style={styles.button} onClick={() => openModal(true)}>
          Add Coxswain
        </button>
      </span>
    );
  }
}