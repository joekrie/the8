import { Component } from "react";

export default class Event extends Component {
  render() {
    const { event } = this.props;

    return (
      <div className="container">
        <div>
          {event.date.toString()}
        </div>
      </div>
    );
  }
}