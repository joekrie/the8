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
    
    const onChangeName = event => {
      this.setState({ name: event.target.value });
    };
    
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
      "color": "white",
      "padding": "10px",
      "margin": "10px",
      "backgroundColor": "#2A4458"
    };
    
    return (
      <div style={styles}>
        <Modal isOpen={this.state.open} onRequestClose={() => this.resetState()}>
          <button onClick={() => this.resetState()}>Close</button>
          <div>
            Add Attendee
          </div>
          <label>
            Name
            <input value={this.state.name} 
              onChange={evt => this.setState({ name: evt.target.value })} />
          </label>
          <button onClick={onSubmit}>
            Add
          </button>
        </Modal>
        <button onClick={() => openModal(false)}>Add Rower</button>
        <button onClick={() => openModal(true)}>Add Coxswain</button>
      </div>
    );
  }
}