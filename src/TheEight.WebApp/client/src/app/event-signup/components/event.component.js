import { Component } from "react"

import { formatLocalDate } from "../../../common/date-utils";

export default class Event extends Component {
  render() {
    const {
      eventListItem,
      registerAction,
      registerLabel,
      attendees
    } = this.props
    
    const attendeeListItems = attendees.map(attn => (
      <li key={attn.attendeeId}>
        {attn.displayName}
      </li>
    ))

    const formattedDate = formatLocalDate(eventListItem.event.date)
  
    return (
      <div className="card">
        <h3 className="card-header">
          {formattedDate}
        </h3>
        <div className="card-block">
          <button className="btn btn-primary" onClick={() => registerAction()}>
            {registerLabel}
          </button>
        </div>
        <ul>
          {attendeeListItems}
        </ul>
      </div>
    )
  }
}