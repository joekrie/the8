import { random } from "lodash";
import { Component } from "react";

import DateField from "./date-field";
import Boat from "./boat";
import { RACE_MODE, PRACTICE_MODE } from "../models/event-modes";

export default class EventDetails extends Component {
  constructor() {
    super();

    this.state = { exampleNote: undefined };
  }

  render() {
    const { changeEventDetails } = this.props;
    const { date, notes, mode } = this.props.eventDetails;

    const exampleNotes = [
      "Race day!!",
      "6 x 4min",
      "Warmup to railroad bridge...",
      "Good luck",
      "Sunrises!"
    ];

    const getExampleNote = () => {
      if (!this.state.exampleNote) {
        const rnd = random(exampleNotes.length - 1);
        const note = exampleNotes[rnd];
        this.setState({ exampleNote: `e.g., ${note}` });
      }

      return this.state.exampleNote;
    };
    
    return (
      <div>
        <DateField value={date} onChange={newValue => changeEventDetails("date", newValue)} />
        <fieldset className="form-group">
          <label htmlFor="notes">
            Notes
          </label>
          <textarea id="notes" className="form-control" rows="5" value={notes} 
            placeholder={getExampleNote()}
            onChange={evt => changeEventDetails("notes", evt.target.value)}></textarea>
        </fieldset>
      </div>
    );
  }
}