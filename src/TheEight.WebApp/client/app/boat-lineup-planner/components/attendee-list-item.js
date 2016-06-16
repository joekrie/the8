import { Component } from "react";
import { DragSource } from "react-dnd";

import { defaultDragCollect } from "../../common/dnd-defaults";
import { ATTENDEE_LIST_ITEM } from "../item-types";
import { RACE_MODE } from "../models/event-modes";
import Attendee from "./attendee";

export const dragSpec = {
  canDrag(props) {
    const { attendeeListItem, eventDetails } = props;
    return eventDetails.mode === RACE_MODE || !attendeeListItem.isAssigned;
  },
  beginDrag(props) {
    const { attendeeListItem } = props;
    
    return {
      draggedAttendeeId: attendeeListItem.attendee.attendeeId
    };
  }
};

@DragSource(ATTENDEE_LIST_ITEM, dragSpec, defaultDragCollect)
export default class AttendeeListItem extends Component {
  render() {
    const { attendeeListItem, connectDragSource } = this.props;

    const styles = {
      "marginBottom": "10px"
    };

    return connectDragSource(
      <div style={styles}>
        <Attendee attendee={attendeeListItem.attendee} />
      </div>
    );
  }
}