import { random } from "lodash";
import { Component } from "react";

import DateField from "./date-field";
import { RACE_MODE, PRACTICE_MODE } from "../models/event-modes";

export default class EventDetails extends Component {
  constructor() {
    super();
    this.state = { exampleNote: undefined };
  }

  componentDidMount() {
    if (!this.state.exampleNote) {
      const exampleNotes = [
        "Race day!!",
        "6 x 4min w/1min rest",
        "Warmup by pairs to railroad bridge...",
        "Enjoy the sunrise :)",
        "It's windy out there, be careful"
      ];

      const rnd = random(exampleNotes.length - 1);
      const note = exampleNotes[rnd];
      this.setState({ exampleNote: `e.g., ${note}` });
    }
  }

  render() {
    const { changeEventDetails } = this.props;
    const { date, notes } = this.props.eventDetails;
    
    return (
      <div>
        <DateField value={date} onChange={newValue => changeEventDetails("date", newValue)} />
        <fieldset className="form-group">
          <label htmlFor="notes">
            Notes
          </label>
          <textarea id="notes" className="form-control" rows="5" value={notes} 
            placeholder={this.state.exampleNote}
            onChange={evt => changeEventDetails("notes", evt.target.value)}></textarea>
        </fieldset>
      </div>
    );
  }
}