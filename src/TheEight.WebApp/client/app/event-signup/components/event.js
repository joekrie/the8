import { Component } from "react";

import AttendeeList from "attendee-list";

export default class Event extends Component {
  render() {
    const { showOthersAttending } = this.props;
    const { notes } = this.props.event;

    const attendeeList = showOthersAttending 
      ? <AttendeeList attendees={attendees} />
      : null;

    return (
      <div>
        <div>
          {notes}
        </div>
        {attendeeList}
      </div>
    );
  }
}