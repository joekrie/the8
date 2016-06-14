import { Component } from "react";
import Modal from "react-modal";

import BoatDetailsRecord from "../models/boat-details-record";

export default class BoatCreator extends Component {  
  constructor() {
    super();

    this.state = {
      seatCount: 4,
      isCoxed: true,
      title: "",
      open: false
    };
  }
  
  resetState() {
    this.setState({
      seatCount: 4,
      isCoxed: true,
      title: "",
      open: false
    });
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
        <Modal isOpen={this.state.open} onRequestClose={() => this.resetState()}>
          <button onClick={() => this.resetState()}>Close</button>
          <div>
            Add Boat
          </div>
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
        </Modal>
        <button onClick={() => this.setState({open:true})}>Add Boat</button>
      </div>
    );
  }
}