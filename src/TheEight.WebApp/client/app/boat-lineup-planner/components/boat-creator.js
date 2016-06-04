import { Component } from "react";

import BoatDetailsRecord from "../models/boat-details-record";

export default class BoatCreator extends Component {  
  constructor() {
    super();
    
    this.state = {
      seatCount: 4,
      isCoxed: true,
      title: ""
    }
  }
  
  render() {
    const { createBoat } = this.props;
    
    const onChangeTitle = event => {
      this.setState({ title: event.target.value });
    };
    
    const onChangeType = event => {
      const value = event.target.value;
      const seatCount = Number(value[0]);
      const isCoxed = value[1] === "+";
      this.setState({ seatCount, isCoxed });
    };
    
    const onSubmit = () => {
      const { title, seatCount, isCoxed } = this.state;
      const boatId = "new-boat-" + Date.now();
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
          Add Boat
        </h2>
        <label>
          Title
          <input value={this.state.title} onChange={onChangeTitle} />
        </label>
        <select value={getTypeValue()} onChange={onChangeType}>
          <option value="1x">1x</option> 
          <option value="2x">2x</option>
          <option value="4x">4x</option>
          <option value="4+">4+</option>
          <option value="8+">8+</option>
        </select>
        <button onClick={onSubmit}>
          Add
        </button>
      </div>
    );
  }
}