import { random } from "lodash"
import { Component } from "react"

import DateField from "boat-lineup-planner/components/date-field"
import { RACE_MODE, PRACTICE_MODE } from "boat-lineup-planner/models/event/event-modes"

export default class EventDetails extends Component {
  constructor() {
    super()
    this.state = { exampleNote: undefined }
  }

  render() {
    const { changeEventDetails } = this.props
    const { date, notes } = this.props.eventDetails
    
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
    )
  }
}
