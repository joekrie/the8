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
      button: {
        "marginRight": "5px"
      }
    };
    
    return (
      <span>
        <Modal isOpen={this.state.open} onRequestClose={() => this.resetState()}>
          <fieldset className="form-group">
            <label htmlFor="new-boat-title">
              Title
            </label>
            <input className="form-control" id="new-boat-title" value={this.state.title} onChange={onChangeTitle} />
          </fieldset>
          <fieldset className="form-group">
            <select className="form-control" value={getTypeValue()} onChange={onChangeType}>
              <option value="1x">1x</option> 
              <option value="2x">2x</option>
              <option value="4x">4x</option>
              <option value="4+">4+</option>
              <option value="8+">8+</option>
            </select>
          </fieldset>
          <button className="btn btn-primary" onClick={onSubmit}>
            Add
          </button>
        </Modal>
        <button className="btn btn-secondary btn-sm"  style={styles.button} 
          onClick={() => this.setState({open:true})}>
          Add Boat
        </button>
      </span>
    );
  }
}