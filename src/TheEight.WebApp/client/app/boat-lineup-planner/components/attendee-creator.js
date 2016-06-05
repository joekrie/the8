import { Component } from "react";

import BoatDetailsRecord from "../models/boat-details-record";

export default class BoatCreator extends Component {  
  constructor() {
    super();
    
    this.state = {
      name: "",
      isCoxswain: false
    }
  }
  
  render() {
    const { createBoat } = this.props;
    
    const onChangeName = event => {
      this.setState({ title: event.target.value });
    };
    
    const onChangeType = event => {
      const value = event.target.value;
      const seatCount = Number(value[0]);
      const isCoxed = value[1] === "+";
      this.setState({ seatCount, isCoxed });
    };
    
    const onSubmit = () => {
      const { name } = this.state;
      const attendeeId = "new-boat-" + Date.now();
      const newBoatDetails = new BoatDetailsRecord({ boatId, title, seatCount, isCoxed });
      createBoat(newBoatDetails);
    };
    
    const getTypeValue = () => {
      const { seatCount, isCoxed } = this.state;
      return String(seatCount) + (isCoxed ? "+" : "x");
    };
    
    const styles = {
      "color": "white"
    };
    
    return (
      <div style={styles}>
        <h2>
          Add Attendee
        </h2>
        <label>
          Name
          <input value={this.state.title} onChange={onChangeTitle} />
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