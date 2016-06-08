import { Component } from "react";

export default class AttendeeList extends Component {
  render() {
    const { showAttendeesSignedUp } = this.props;
    const { title } = this.props.event;

    return (
      <div>
        <div>
          {title}
        </div>
        <div>
          
        </div>
      </div>
    );
  }
}