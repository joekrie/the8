import { Component } from "react"

export default class Event extends Component {
  render() {
    const {
      eventListItem,
      registerAction,
      registerLabel
    } = this.props

    const attendeeListItems = eventListItem.attendees.map(attn => (
      <li key={attn.attendeeId}>
        {attn.displayName}
      </li>
    ))
  
    return (
      <div className="card">
        <div className="card-header">
          {eventListItem.event.date.toString()}
        </div>
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