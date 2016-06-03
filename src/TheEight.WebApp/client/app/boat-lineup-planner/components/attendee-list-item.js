import Radium from "radium";
import { Component } from "react";
import { DragSource } from "react-dnd";

import { defaultDragCollect } from "../../common/dnd-defaults";
import { ATTENDEE_LIST_ITEM } from "../item-types";

export const dragSpec = {
  beginDrag(props) {
    return {
      draggedAttendeeId: props.attendeeListItem.attendee.attendeeId
    }
  }
};

@Radium
@DragSource(ATTENDEE_LIST_ITEM, dragSpec, defaultDragCollect)
export default class AttendeeListItem extends Component {
  render() {
    const { attendeeListItem, connectDragSource } = this.props;

    const styles = {
      "marginBottom": "10px",
      "padding": "10px",
      "color": "#F5F5F5",
      "cursor": "grab",
      "backgroundColor": attendeeListItem.attendee.isCoxswain ? "#304F66" : "#2A4458"
    };

    return connectDragSource(
      <div style={styles}>
        {attendeeListItem.attendee.displayName}
      </div>
    );
  }
}