import { Component } from "react";

import AttendeeRecord from "../models/attendee-record";

export default class BoatCreator extends Component {  
  constructor() {
    super();
    this.resetState();
  }
  
  resetState() {
    this.state = {
      name: "",
      isCoxswain: false
    }
  }
  
  render() {
    const { createAttendee } = this.props;
    
    const onChangeName = event => {
      this.setState({ name: event.target.value });
    };
    
    const onChangeRole = event => {
      const value = event.target.value;
      this.setState({ isCoxswain: value });
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
    
    const styles = {
      "color": "white",
      "padding": "10px",
      "margin": "10px",
      "backgroundColor": "#2A4458"
    };
    
    return (
      <div style={styles}>
        <div>
          Add Attendee
        </div>
        <label>
          Name
          <input value={this.state.name} onChange={onChangeName} />
        </label>
        <select value={this.state.isCoxswain} onChange={onChangeRole}>
          <option value="false">Rower</option> 
          <option value="true">Coxswain</option>
        </select>
        <button onClick={onSubmit}>
          Add
        </button>
      </div>
    );
  }
}