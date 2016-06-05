import { Component } from "react";

import Boat from "./boat";
import { RACE_MODE, PRACTICE_MODE } from "../models/event-modes";

export default class EventDetails extends Component {  
  render() {
    const { changeEventDetails } = this.props;
    const { title, mode } = this.props.eventDetails;
    
    const styles = {
      "backgroundColor": "#263F52",
      "color": "white",
      "marginBottom": "10px",
      "padding": "10px"
    };
        
    return (
      <div style={styles}>
        <h1>{title}</h1>
        <label>
          <input value={title} onChange={evt => changeEventDetails("title", evt.target.value)} />
        </label>
        <div>
          <label>
            <input name="mode" type="radio" checked={mode === PRACTICE_MODE} 
              onChange={evt => changeEventDetails("mode", PRACTICE_MODE)} />
            Practice mode
          </label>
          <label> 
            <input name="mode" type="radio" checked={mode === RACE_MODE} 
              onChange={evt => changeEventDetails("mode", RACE_MODE)} />
            Race mode
          </label>
        </div>
      </div>
    );
  }
}