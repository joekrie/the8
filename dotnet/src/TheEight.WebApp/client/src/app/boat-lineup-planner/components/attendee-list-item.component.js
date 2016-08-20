import { Component } from "react";
import { DragSource } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

import Attendee from "./attendee.component";

import "./attendee-list-item.component.scss"

export const dragSpec = {
  canDrag(props) {
    const { attendeeListItem, eventDetails } = props;
    return eventDetails.mode === RACE_MODE || !attendeeListItem.isAssigned;
  },
  beginDrag(props) {
    const { attendeeListItem } = props;
    
    return {
      draggedAttendeeId: attendeeListItem.attendee.attendeeId,
      draggedAttendeeName: attendeeListItem.attendee.displayName
    };
  }
};

export const dragCollect = connect => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview()
});

@DragSource("ATTENDEE_LIST_ITEM", dragSpec, dragCollect)
export default class AttendeeListItem extends Component {
  componentDidMount() {
    const { connectDragPreview } = this.props;
    connectDragPreview(getEmptyImage());
  }

  render() {
    const { attendeeListItem, connectDragSource } = this.props;

    return (
      connectDragSource(
        <div className="attendee-list-item">
          <Attendee attendee={attendeeListItem.attendee} />
        </div>
      )
    )
  }
}
