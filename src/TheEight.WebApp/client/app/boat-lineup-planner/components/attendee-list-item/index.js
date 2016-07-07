import { Component } from "react";
import { DragSource } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

import { defaultDragCollect } from "common/dnd-defaults";
import { ATTENDEE_LIST_ITEM } from "boat-lineup-planner/dnd-item-types";
import { RACE_MODE } from "boat-lineup-planner/models/event-modes";
import Attendee from "boat-lineup-planner/components/attendee";

import "./styles.scss"

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

const collect = connect => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview()
});

@DragSource(ATTENDEE_LIST_ITEM, dragSpec, collect)
export default class AttendeeListItem extends Component {
  componentDidMount() {
    const { connectDragPreview } = this.props;
    connectDragPreview(getEmptyImage());
  }

  render() {
    const {
      attendeeListItem, 
      connectDragSource
    } = this.props;

    return (
      connectDragSource(
        <div className="attendee-list-item">
          <Attendee attendee={attendeeListItem.attendee} />
        </div>
      )
    );
  }
}